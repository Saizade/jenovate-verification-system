const express = require('express');
const router = express.Router();
const { body, query, validationResult } = require('express-validator');
const { Student, VerificationResult, Employee, Notification } = require('../models');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const { uploadMultiple } = require('../middleware/upload');
const { generateReferenceId } = require('../services/referenceId');
const { Op } = require('sequelize');

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
      const { search, course, state, paymentStatus, counselor, department, dateFrom, dateTo } = req.query;

      // Build where clause
      const where = {};

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
          { course_name: { [Op.like]: `%${course}%` } },
          { course_opted: { [Op.like]: `%${course}%` } }
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

module.exports = router;
