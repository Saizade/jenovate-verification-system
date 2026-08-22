const express = require('express');
const router = express.Router();
const { body, query, validationResult } = require('express-validator');
const { Student, VerificationResult, Employee, Notification } = require('../models');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const { uploadMultiple, uploadExcelSingle } = require('../middleware/upload');
const { generateReferenceId } = require('../services/referenceId');
const { Op } = require('sequelize');
const ExcelJS = require('exceljs');
const fs = require('fs');


// 1. POST /api/students - Submit student form (Public)
router.post(
  '/',
  (req, res, next) => {
    uploadMultiple(req, res, (err) => {
      if (err) {
        return next(err);
      }
      next();
    });
  },
  [
    body('fullName').notEmpty().withMessage('Full name is required').trim()
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      // Generate reference ID
      const reference_id = await generateReferenceId();

      // Process uploaded documents
      const documents = {};
      if (req.files) {
        if (req.files.aadhaarDoc && req.files.aadhaarDoc[0]) {
          documents.aadhaarDoc = `uploads/${req.files.aadhaarDoc[0].filename}`;
        }
        if (req.files.photoDoc && req.files.photoDoc[0]) {
          documents.photoDoc = `uploads/${req.files.photoDoc[0].filename}`;
        }
        if (req.files.receiptDoc && req.files.receiptDoc[0]) {
          documents.receiptDoc = `uploads/${req.files.receiptDoc[0].filename}`;
        }
      }

      const programPrice = parseFloat(req.body.programPrice) || 0;
      const amountReceived = parseFloat(req.body.amountReceived) || 0;
      const pendingAmount = req.body.pendingAmount !== undefined && req.body.pendingAmount !== ''
        ? parseFloat(req.body.pendingAmount)
        : (programPrice - amountReceived);

      // Create student record with 24 fields
      const student = await Student.create({
        reference_id,
        s_no: req.body.sNo || req.body.s_no || null,
        remarks: req.body.remarks || null,
        date: req.body.date || new Date().toISOString().split('T')[0],
        academic_remarks: req.body.academicRemarks || req.body.academic_remarks || null,
        counselor_name: req.body.counselorName || req.body.counselor_name || null,
        full_name: req.body.fullName || req.body.full_name,
        phone_no: req.body.phoneNo || req.body.phone_no || req.body.mobile || null,
        whatsapp_number: req.body.whatsappNumber || req.body.whatsapp_number || null,
        email: req.body.email || null,
        college_name: req.body.collegeName || req.body.college_name || null,
        state: req.body.state || null,
        department: req.body.department || null,
        course_opted: req.body.courseOpted || [req.body.primaryCourse, req.body.secondaryCourse, req.body.tertiaryCourse].filter(Boolean).join(', ') || null,
        primary_course: req.body.primaryCourse || req.body.primary_course || null,
        secondary_course: req.body.secondaryCourse || req.body.secondary_course || null,
        tertiary_course: req.body.tertiaryCourse || req.body.tertiary_course || null,
        type_of_pack: req.body.typeOfPack || (parseInt(req.body.numCoursesSelected) === 3 ? 'Triple courses' : parseInt(req.body.numCoursesSelected) === 2 ? 'Dual Course' : 'Single Course'),
        month_opted: req.body.monthOpted || req.body.month_opted || null,
        type_of_course: req.body.typeOfCourse || req.body.type_of_course || null,
        payment_mode: req.body.paymentMode || req.body.payment_mode || null,
        program_price: programPrice,
        amount_received: amountReceived,
        pending_amount: pendingAmount,
        revenue_channel: req.body.revenueChannel || req.body.revenue_channel || null,
        documents,
        is_locked: true,
        submitted_by: req.user ? req.user.id : null
      });

      // Create notification for admins
      await Notification.create({
        type: 'new_student',
        title: 'New Student Registration',
        message: `New student "${student.full_name}" registered with reference ID: ${reference_id}`,
        reference_id,
        is_read: false,
        user_id: null // null = visible to all admins
      });

      return res.status(201).json({
        success: true,
        message: 'Student registered successfully',
        data: student
      });
    } catch (error) {
      next(error);
    }
  }
);

// 2. GET /api/students/status/:referenceId - Check submission status (Public)
router.get('/status/:referenceId', async (req, res, next) => {
  try {
    const { referenceId } = req.params;

    const student = await Student.findOne({
      where: { reference_id: referenceId },
      attributes: ['id', 'reference_id', 'full_name', 'course_name', 'payment_amount', 'joining_date', 'is_locked', 'created_at']
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found with this reference ID'
      });
    }

    const verification = await VerificationResult.findOne({
      where: { reference_id: referenceId }
    });

    return res.json({
      success: true,
      message: 'Status retrieved successfully',
      data: {
        student,
        verification: verification || null
      }
    });
  } catch (error) {
    next(error);
  }
});

// Protect all other routes below
router.use(auth);

// GET /api/students/reference/:referenceId - Get student by reference ID
router.get('/reference/:referenceId', async (req, res, next) => {
  try {
    const { referenceId } = req.params;

    const student = await Student.findOne({
      where: { reference_id: referenceId },
      include: [
        {
          model: Employee,
          as: 'submittedBy',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found with this reference ID'
      });
    }

    // Check access: admin can access any, others only their own submissions
    if (req.user.role !== 'admin' && student.submitted_by !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own submissions.'
      });
    }

    return res.json({
      success: true,
      message: 'Student retrieved successfully',
      data: { student }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/students - Admin only. List all with pagination
router.get(
  '/',
  roleCheck(['admin']),
  async (req, res, next) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;
      const { search, course, state, paymentStatus, counselor, department, dateFrom, dateTo, monthOpted, month } = req.query;

      // Build where clause
      const where = {};

      const monthFilter = monthOpted || month;
      if (monthFilter) {
        where.month_opted = { [Op.like]: `%${monthFilter}%` };
      }

      if (search) {
        where[Op.or] = [
          { full_name: { [Op.like]: `%${search}%` } },
          { reference_id: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } },
          { phone_no: { [Op.like]: `%${search}%` } },
          { college_name: { [Op.like]: `%${search}%` } }
        ];
      }

      if (course) {
        where[Op.or] = [
          { course_opted: { [Op.like]: `%${course}%` } },
          { primary_course: { [Op.like]: `%${course}%` } }
        ];
      }

      if (state) {
        where.state = { [Op.like]: `%${state}%` };
      }

      if (counselor) {
        where.counselor_name = { [Op.like]: `%${counselor}%` };
      }

      if (department) {
        where.department = { [Op.like]: `%${department}%` };
      }

      if (paymentStatus === 'pending') {
        where.pending_amount = { [Op.gt]: 0 };
      } else if (paymentStatus === 'paid') {
        where[Op.or] = [
          { pending_amount: { [Op.lte]: 0 } },
          { pending_amount: null }
        ];
      }

      if (dateFrom || dateTo) {
        where.created_at = {};
        if (dateFrom) {
          where.created_at[Op.gte] = new Date(dateFrom);
        }
        if (dateTo) {
          where.created_at[Op.lte] = new Date(dateTo + 'T23:59:59');
        }
      }

      const { count: total, rows: students } = await Student.findAndCountAll({
        where,
        include: [
          {
            model: Employee,
            as: 'submittedBy',
            attributes: ['id', 'name', 'email']
          }
        ],
        order: [['created_at', 'DESC']],
        limit,
        offset
      });

      return res.json({
        success: true,
        message: 'Students retrieved successfully',
        data: {
          students,
          total,
          page,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/students/:id - Admin only. Get single student
router.get(
  '/:id',
  roleCheck(['admin']),
  async (req, res, next) => {
    try {
      const student = await Student.findByPk(req.params.id, {
        include: [
          {
            model: Employee,
            as: 'submittedBy',
            attributes: ['id', 'name', 'email']
          }
        ]
      });

      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Student not found'
        });
      }

      return res.json({
        success: true,
        message: 'Student retrieved successfully',
        data: { student }
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/students/import-excel - Admin only. Import students from Excel sheet
router.post(
  '/import-excel',
  roleCheck(['admin']),
  (req, res, next) => {
    uploadExcelSingle(req, res, (err) => {
      if (err) {
        return res.status(400).json({ success: false, message: err.message || 'File upload failed' });
      }
      next();
    });
  },
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded. Please select an Excel (.xlsx, .xls) or CSV (.csv) file.'
        });
      }

      const filePath = req.file.path;
      const workbook = new ExcelJS.Workbook();

      if (req.file.originalname.toLowerCase().endsWith('.csv')) {
        await workbook.csv.readFile(filePath);
      } else {
        await workbook.xlsx.readFile(filePath);
      }

      const worksheet = workbook.worksheets[0];
      if (!worksheet || worksheet.rowCount < 2) {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        return res.status(400).json({
          success: false,
          message: 'The uploaded file is empty or contains no data rows.'
        });
      }

      // Map column headers from Row 1
      const headerRow = worksheet.getRow(1);
      const colMap = {};
      
      headerRow.eachCell({ includeEmpty: false }, (cell, colNumber) => {
        let val = String(cell.value || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
        colMap[colNumber] = val;
      });

      const FIELD_ALIASES = {
        sNo: ['sno', 'serialno', 'sn', 'snumber'],
        remarks: ['remarks', 'statusremarks', 'remark'],
        dateVal: ['date', 'joiningdate', 'registrationdate', 'createdat'],
        academicRemarks: ['academicremarks', 'academicremark', 'academic'],
        counselorName: ['counselorname', 'counselor'],
        fullName: ['fullname', 'studentname', 'name', 'student'],
        phoneNo: ['phoneno', 'phone', 'mobile', 'phonenumber', 'contact', 'contactno'],
        whatsappNumber: ['whatsappnumber', 'whatsapp', 'whatsappno'],
        email: ['email', 'emailid', 'mail'],
        collegeName: ['collegename', 'college', 'institution', 'university'],
        state: ['state', 'region', 'location'],
        department: ['department', 'dept', 'branch'],
        courseOpted: ['courseopted', 'course', 'coursename', 'courses'],
        primaryCourse: ['primarycourse'],
        secondaryCourse: ['secondarycourse'],
        tertiaryCourse: ['tertiarycourse'],
        typeOfPack: ['typeofpack', 'packtype', 'pack'],
        monthOpted: ['monthopted', 'month'],
        typeOfCourse: ['typeofcourse', 'coursetype'],
        paymentMode: ['paymentmode', 'paymode', 'modeofpayment', 'mode'],
        programPrice: ['programprice', 'totalprice', 'totalfees', 'programfee', 'price'],
        amountReceived: ['amountreceived', 'receivedamount', 'received', 'feespaid', 'amountpaid', 'paidamount'],
        pendingAmount: ['pendingamount', 'pending', 'dues', 'balance', 'pendingdues'],
        revenueChannel: ['revenuechannel', 'channel', 'source'],
        refId: ['referenceid', 'refid', 'reference']
      };

      const getColNumForField = (aliases) => {
        for (const alias of aliases) {
          for (const [colNum, colName] of Object.entries(colMap)) {
            if (colName === alias) return parseInt(colNum);
          }
        }
        for (const alias of aliases) {
          if (alias.length < 4) continue;
          for (const [colNum, colName] of Object.entries(colMap)) {
            if (colName.includes(alias)) return parseInt(colNum);
          }
        }
        return null;
      };

      const getValByField = (row, aliases) => {
        const colNum = getColNumForField(aliases);
        if (!colNum) return null;
        const cell = row.getCell(colNum);
        if (!cell || cell.value === null || cell.value === undefined) return null;
        let val = cell.value;
        if (typeof val === 'object') {
          if (val.result !== undefined) val = val.result;
          else if (val.text !== undefined) val = val.text;
          else if (val.richText) val = val.richText.map(r => r.text).join('');
        }
        return String(val).trim();
      };

      const parseMoney = (val) => {
        if (!val) return 0;
        const cleaned = String(val).replace(/[^0-9.]/g, '');
        const num = parseFloat(cleaned);
        return isNaN(num) ? 0 : num;
      };

      const createdStudents = [];
      const errors = [];

      for (let i = 2; i <= worksheet.rowCount; i++) {
        const row = worksheet.getRow(i);
        
        // Extract basic identifier fields to verify non-empty row
        const fullName = getValByField(row, FIELD_ALIASES.fullName) || '';
        const phoneNo = getValByField(row, FIELD_ALIASES.phoneNo) || '';
        const email = getValByField(row, FIELD_ALIASES.email) || '';
        const collegeName = getValByField(row, FIELD_ALIASES.collegeName) || '';

        // Skip blank rows
        if (!fullName && !phoneNo && !email && !collegeName) {
          continue;
        }

        const sNo = getValByField(row, FIELD_ALIASES.sNo) || null;
        const remarks = getValByField(row, FIELD_ALIASES.remarks) || null;
        const dateVal = getValByField(row, FIELD_ALIASES.dateVal) || new Date().toISOString().split('T')[0];
        const academicRemarks = getValByField(row, FIELD_ALIASES.academicRemarks) || null;
        const counselorName = getValByField(row, FIELD_ALIASES.counselorName) || null;
        const whatsappNumber = getValByField(row, FIELD_ALIASES.whatsappNumber) || phoneNo || null;
        const state = getValByField(row, FIELD_ALIASES.state) || null;
        const department = getValByField(row, FIELD_ALIASES.department) || null;
        const courseOpted = getValByField(row, FIELD_ALIASES.courseOpted) || null;
        const primaryCourse = getValByField(row, FIELD_ALIASES.primaryCourse) || courseOpted || null;
        const secondaryCourse = getValByField(row, FIELD_ALIASES.secondaryCourse) || null;
        const tertiaryCourse = getValByField(row, FIELD_ALIASES.tertiaryCourse) || null;
        const typeOfPack = getValByField(row, FIELD_ALIASES.typeOfPack) || 'Single Course';
        const monthOpted = getValByField(row, FIELD_ALIASES.monthOpted) || null;
        const typeOfCourse = getValByField(row, FIELD_ALIASES.typeOfCourse) || null;
        const paymentMode = getValByField(row, FIELD_ALIASES.paymentMode) || null;
        
        const rawProgPrice = getValByField(row, FIELD_ALIASES.programPrice);
        const rawAmtRec = getValByField(row, FIELD_ALIASES.amountReceived);
        const rawPending = getValByField(row, FIELD_ALIASES.pendingAmount);

        const programPrice = parseMoney(rawProgPrice);
        const amountReceived = parseMoney(rawAmtRec);
        let pendingAmount = rawPending ? parseMoney(rawPending) : Math.max(0, programPrice - amountReceived);

        const revenueChannel = getValByField(row, FIELD_ALIASES.revenueChannel) || null;

        let refId = getValByField(row, FIELD_ALIASES.refId) || null;
        if (!refId || !refId.startsWith('JNV-')) {
          refId = await generateReferenceId();
        }

        try {
          const student = await Student.create({
            reference_id: refId,
            s_no: sNo,
            remarks,
            date: dateVal,
            academic_remarks: academicRemarks,
            counselor_name: counselorName,
            full_name: fullName || 'Unnamed Student',
            phone_no: phoneNo || null,
            whatsapp_number: whatsappNumber,
            email: email || null,
            college_name: collegeName || null,
            state,
            department,
            course_opted: courseOpted,
            primary_course: primaryCourse,
            secondary_course: secondaryCourse,
            tertiary_course: tertiaryCourse,
            type_of_pack: typeOfPack,
            month_opted: monthOpted,
            type_of_course: typeOfCourse,
            payment_mode: paymentMode,
            program_price: programPrice,
            amount_received: amountReceived,
            pending_amount: pendingAmount,
            revenue_channel: revenueChannel,
            documents: {},
            is_locked: true,
            submitted_by: req.user.id
          });

          createdStudents.push(student);
        } catch (err) {
          console.error(`Row ${i} import error:`, err);
          errors.push(`Row ${i}: ${err.message}`);
        }
      }

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      if (createdStudents.length > 0) {
        await Notification.create({
          type: 'new_student',
          title: 'Excel Bulk Student Import',
          message: `Successfully imported ${createdStudents.length} student records via Excel upload by ${req.user.name}.`,
          reference_id: createdStudents[0].reference_id,
          is_read: false,
          user_id: null
        });
      }

      return res.json({
        success: true,
        message: `Successfully imported ${createdStudents.length} student record(s) directly from Excel sheet.`,
        data: {
          importedCount: createdStudents.length,
          errors
        }
      });
    } catch (error) {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      next(error);
    }
  }
);

// GET /api/students/sample-excel - Admin only. Download sample Excel template
router.get(
  '/sample-excel',
  roleCheck(['admin']),
  async (req, res, next) => {
    try {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('Student Import Template');

      sheet.columns = [
        { header: 'S.no', key: 's_no', width: 10 },
        { header: 'Counselor Name', key: 'counselor_name', width: 20 },
        { header: 'Student Name', key: 'full_name', width: 25 },
        { header: 'Phone No.', key: 'phone_no', width: 16 },
        { header: 'WhatsApp Number', key: 'whatsapp_number', width: 18 },
        { header: 'E-mail', key: 'email', width: 28 },
        { header: 'College Name', key: 'college_name', width: 30 },
        { header: 'State', key: 'state', width: 16 },
        { header: 'Department', key: 'department', width: 18 },
        { header: 'Course Opted', key: 'course_opted', width: 25 },
        { header: 'Primary Course', key: 'primary_course', width: 22 },
        { header: 'Secondary Course', key: 'secondary_course', width: 20 },
        { header: 'Tertiary Course', key: 'tertiary_course', width: 20 },
        { header: 'Type of Pack', key: 'type_of_pack', width: 16 },
        { header: 'Month Opted', key: 'month_opted', width: 14 },
        { header: 'Type of Course', key: 'type_of_course', width: 25 },
        { header: 'Payment Mode', key: 'payment_mode', width: 16 },
        { header: 'Program Price', key: 'program_price', width: 15 },
        { header: 'Amount Received', key: 'amount_received', width: 16 },
        { header: 'Pending Amount', key: 'pending_amount', width: 16 },
        { header: 'Revenue Channel', key: 'revenue_channel', width: 20 },
        { header: 'Remarks', key: 'remarks', width: 20 },
        { header: 'Academic Remarks', key: 'academic_remarks', width: 22 }
      ];

      const headerRow = sheet.getRow(1);
      headerRow.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF4F46E5' }
        };
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      });

      sheet.addRow({
        s_no: 1,
        counselor_name: 'Rahul Sharma',
        full_name: 'Aarav Patel',
        phone_no: '9876543210',
        whatsapp_number: '9876543210',
        email: 'aarav.patel@example.com',
        college_name: 'IIT Bombay',
        state: 'Maharashtra',
        department: 'Computer Science',
        course_opted: 'Java Full Stack',
        primary_course: 'Java',
        secondary_course: 'React',
        tertiary_course: '',
        type_of_pack: 'Dual Course',
        month_opted: 'August 2026',
        type_of_course: 'Full Stack Web Development',
        payment_mode: 'UPI',
        program_price: 15000,
        amount_received: 10000,
        pending_amount: 5000,
        revenue_channel: 'Online Campaign',
        remarks: 'Batch A',
        academic_remarks: 'Good background'
      });

      const buffer = await workbook.xlsx.writeBuffer();

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=students-import-sample-template.xlsx');
      return res.send(buffer);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;

