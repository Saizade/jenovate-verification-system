const express = require('express');
const router = express.Router();
const { Student, VerificationResult } = require('../models');
const { Op } = require('sequelize');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const exportService = require('../services/exportService');

router.use(auth);
router.use(roleCheck(['admin']));

// GET /api/export/students/pdf - Export students to PDF
router.get('/students/pdf', async (req, res, next) => {
  try {
    const { search, course, state, paymentStatus, dateFrom, dateTo, monthOpted, month } = req.query;

    const whereClause = {};
    const monthFilter = monthOpted || month;
    if (monthFilter) {
      whereClause.month_opted = { [Op.like]: `%${monthFilter}%` };
    }
    if (search) {
      whereClause[Op.or] = [
        { full_name: { [Op.like]: `%${search}%` } },
        { reference_id: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { phone_no: { [Op.like]: `%${search}%` } },
        { college_name: { [Op.like]: `%${search}%` } }
      ];
    }
    if (course) {
      whereClause[Op.or] = [
        { course_opted: { [Op.like]: `%${course}%` } },
        { primary_course: { [Op.like]: `%${course}%` } }
      ];
    }
    if (state) {
      whereClause.state = { [Op.like]: `%${state}%` };
    }
    if (paymentStatus === 'pending') {
      whereClause.pending_amount = { [Op.gt]: 0 };
    } else if (paymentStatus === 'paid') {
      whereClause[Op.or] = [
        { pending_amount: { [Op.lte]: 0 } },
        { pending_amount: null }
      ];
    }
    if (dateFrom || dateTo) {
      whereClause.created_at = {};
      if (dateFrom) {
        whereClause.created_at[Op.gte] = new Date(dateFrom);
      }
      if (dateTo) {
        whereClause.created_at[Op.lte] = new Date(dateTo);
      }
    }

    const students = await Student.findAll({
      where: whereClause,
      order: [['created_at', 'DESC']]
    });

    const pdfBuffer = await exportService.exportStudentsPDF(students);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=students-report.pdf');
    return res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
});

// GET /api/export/students/excel - Export students to Excel
router.get('/students/excel', async (req, res, next) => {
  try {
    const { search, course, state, paymentStatus, dateFrom, dateTo, monthOpted, month } = req.query;

    const whereClause = {};
    const monthFilter = monthOpted || month;
    if (monthFilter) {
      whereClause.month_opted = { [Op.like]: `%${monthFilter}%` };
    }
    if (search) {
      whereClause[Op.or] = [
        { full_name: { [Op.like]: `%${search}%` } },
        { reference_id: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { phone_no: { [Op.like]: `%${search}%` } },
        { college_name: { [Op.like]: `%${search}%` } }
      ];
    }
    if (course) {
      whereClause[Op.or] = [
        { course_opted: { [Op.like]: `%${course}%` } },
        { primary_course: { [Op.like]: `%${course}%` } }
      ];
    }
    if (state) {
      whereClause.state = { [Op.like]: `%${state}%` };
    }
    if (paymentStatus === 'pending') {
      whereClause.pending_amount = { [Op.gt]: 0 };
    } else if (paymentStatus === 'paid') {
      whereClause[Op.or] = [
        { pending_amount: { [Op.lte]: 0 } },
        { pending_amount: null }
      ];
    }
    if (dateFrom || dateTo) {
      whereClause.created_at = {};
      if (dateFrom) {
        whereClause.created_at[Op.gte] = new Date(dateFrom);
      }
      if (dateTo) {
        whereClause.created_at[Op.lte] = new Date(dateTo);
      }
    }

    const students = await Student.findAll({
      where: whereClause,
      order: [['created_at', 'DESC']]
    });

    const excelBuffer = await exportService.exportStudentsExcel(students);

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', 'attachment; filename=students-report.xlsx');
    return res.send(excelBuffer);
  } catch (error) {
    next(error);
  }
});

// GET /api/export/verification/pdf - Export verification results to PDF
router.get('/verification/pdf', async (req, res, next) => {
  try {
    const { matchStatus, fraudLevel } = req.query;
    const whereClause = {};

    if (matchStatus) {
      whereClause.match_status = matchStatus;
    }
    if (fraudLevel) {
      whereClause.fraud_level = fraudLevel;
    }

    const results = await VerificationResult.findAll({
      where: whereClause,
      order: [['verified_at', 'DESC']]
    });

    const pdfBuffer = await exportService.exportVerificationPDF(results);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=verification-report.pdf');
    return res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
});

// GET /api/export/verification/excel - Export verification results to Excel
router.get('/verification/excel', async (req, res, next) => {
  try {
    const { matchStatus, fraudLevel } = req.query;
    const whereClause = {};

    if (matchStatus) {
      whereClause.match_status = matchStatus;
    }
    if (fraudLevel) {
      whereClause.fraud_level = fraudLevel;
    }

    const results = await VerificationResult.findAll({
      where: whereClause,
      order: [['verified_at', 'DESC']]
    });

    const excelBuffer = await exportService.exportVerificationExcel(results);

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', 'attachment; filename=verification-report.xlsx');
    return res.send(excelBuffer);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
