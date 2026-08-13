const express = require('express');
const router = express.Router();
const { VerificationResult, EmployeeSubmission } = require('../models');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const { Op } = require('sequelize');

// All routes require authentication
router.use(auth);
router.use(roleCheck(['admin', 'employee']));

// GET /api/verification - Get verification results (admins see all, employees see their own submissions' results)
router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const { match_status, fraud_level, search } = req.query;

    const where = {};

    // Employee role data isolation check
    if (req.user.role !== 'admin') {
      const mySubmissions = await EmployeeSubmission.findAll({
        where: { employee_id: req.user.id },
        attributes: ['reference_id']
      });
      const myRefIds = mySubmissions.map((s) => s.reference_id);
      where.reference_id = { [Op.in]: myRefIds };
    }

    if (match_status) {
      where.match_status = match_status;
    }

    if (fraud_level) {
      where.fraud_level = fraud_level;
    }

    if (search) {
      if (where.reference_id) {
        where.reference_id = {
          [Op.and]: [
            where.reference_id,
            { [Op.like]: `%${search}%` }
          ]
        };
      } else {
        where.reference_id = { [Op.like]: `%${search}%` };
      }
    }

    const { count: total, rows: results } = await VerificationResult.findAndCountAll({
      where,
      order: [['verified_at', 'DESC']],
      limit,
      offset
    });

    return res.json({
      success: true,
      message: 'Verification results retrieved successfully',
      data: {
        results,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/verification/:referenceId - Get result by reference ID
router.get('/:referenceId', async (req, res, next) => {
  try {
    const { referenceId } = req.params;

    // Security check: non-admins can only see their own submissions
    if (req.user.role !== 'admin') {
      const isMine = await EmployeeSubmission.findOne({
        where: { reference_id: referenceId, employee_id: req.user.id }
      });
      if (!isMine) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only view verification results for your own submissions.'
        });
      }
    }

    const result = await VerificationResult.findOne({
      where: { reference_id: referenceId }
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Verification result not found for this reference ID'
      });
    }

    return res.json({
      success: true,
      message: 'Verification result retrieved successfully',
      data: { result }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
