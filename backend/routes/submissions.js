const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { EmployeeSubmission, Employee } = require('../models');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const { verify } = require('../services/verificationEngine');
const { Op } = require('sequelize');

// All routes are protected
router.use(auth);

// POST /api/submissions - Employee or admin only
router.post(
  '/',
  roleCheck(['employee', 'admin']),
  [
    body('reference_id').notEmpty().withMessage('Reference ID is required').trim(),
    body('student_name').notEmpty().withMessage('Student name is required').trim(),
    body('course_opted').notEmpty().withMessage('Course opted is required').trim(),
    body('fees_paid')
      .notEmpty()
      .withMessage('Fees paid is required')
      .isNumeric()
      .withMessage('Fees paid must be a number')
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

      const {
        reference_id, date, student_name, whatsapp_no, email,
        course_opted, num_courses_selected, primary_course, secondary_course, tertiary_course,
        fees_paid, program_price, pending_amount, payment_mode, revenue_channel, remarks
      } = req.body;

      // Construct course_opted if not explicitly given
      let finalCourseOpted = course_opted;
      if (!finalCourseOpted) {
        const courses = [primary_course, secondary_course, tertiary_course].filter(Boolean);
        finalCourseOpted = courses.join(', ');
      }

      // Create submission
      const submission = await EmployeeSubmission.create({
        reference_id,
        employee_id: req.user.id,
        date: date || null,
        student_name,
        whatsapp_no: whatsapp_no || null,
        email: email || null,
        course_opted: finalCourseOpted || null,
        num_courses_selected: parseInt(num_courses_selected) || 1,
        primary_course: primary_course || null,
        secondary_course: secondary_course || null,
        tertiary_course: tertiary_course || null,
        fees_paid: parseFloat(fees_paid),
        program_price: program_price ? parseFloat(program_price) : null,
        pending_amount: pending_amount ? parseFloat(pending_amount) : null,
        payment_mode: payment_mode || null,
        revenue_channel: revenue_channel || null,
        remarks: remarks || null,
        is_locked: true
      });

      // Auto-trigger verification
      const verificationResult = await verify(reference_id);

      return res.status(201).json({
        success: true,
        message: 'Submission created and verification completed',
        data: {
          submission,
          verification: verificationResult
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/submissions - List submissions
router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const { search } = req.query;

    // Build where clause
    const where = {};

    // Employee can only see their own submissions
    if (req.user.role !== 'admin') {
      where.employee_id = req.user.id;
    }

    if (search) {
      where[Op.or] = [
        { reference_id: { [Op.like]: `%${search}%` } },
        { student_name: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count: total, rows: submissions } = await EmployeeSubmission.findAndCountAll({
      where,
      include: [
        {
          model: Employee,
          as: 'employee',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['created_at', 'DESC']],
      limit,
      offset
    });

    return res.json({
      success: true,
      message: 'Submissions retrieved successfully',
      data: {
        submissions,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/submissions/:id - Get single submission
router.get('/:id', async (req, res, next) => {
  try {
    const submission = await EmployeeSubmission.findByPk(req.params.id, {
      include: [
        {
          model: Employee,
          as: 'employee',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    // Non-admin can only see their own
    if (req.user.role !== 'admin' && submission.employee_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    return res.json({
      success: true,
      message: 'Submission retrieved successfully',
      data: { submission }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
