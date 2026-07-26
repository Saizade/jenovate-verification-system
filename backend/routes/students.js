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
    body('fullName').notEmpty().withMessage('Full name is required').trim(),
    body('course').notEmpty().withMessage('Course name is required').trim()
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

      // Create student record
      const student = await Student.create({
        reference_id,
        full_name: req.body.fullName,
        dob: req.body.dateOfBirth || null,
        gender: req.body.gender || null,
        mobile: req.body.mobile || null,
        email: req.body.email || null,
        father_name: req.body.fatherName || null,
        mother_name: req.body.motherName || null,
        number_of_siblings: parseInt(req.body.siblings) || 0,
        guardian_details: req.body.guardianName ? `${req.body.guardianName} (${req.body.guardianPhone || ''})` : null,
        state: req.body.state || null,
        city: req.body.city || null,
        full_address: req.body.address || null,
        qualification: req.body.qualification || null,
        previous_education: req.body.previousInstitution || null,
        course_name: req.body.course,
        course_fee: parseFloat(req.body.totalFees) || null,
        payment_amount: parseFloat(req.body.amountPaid) || null,
        payment_mode: req.body.paymentMode || null,
        transaction_id: req.body.transactionId || null,
        joining_date: req.body.joiningDate || new Date().toISOString().split('T')[0],
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
      const { search, course, dateFrom, dateTo } = req.query;

      // Build where clause
      const where = {};

      if (search) {
        where[Op.or] = [
          { full_name: { [Op.like]: `%${search}%` } },
          { reference_id: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } }
        ];
      }

      if (course) {
        where.course_name = { [Op.like]: `%${course}%` };
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
