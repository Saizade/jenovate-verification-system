const express = require('express');
const router = express.Router();
const { Student, EmployeeSubmission, VerificationResult, Employee } = require('../models');
const sequelize = require('../config/database');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const { Op, fn, col, literal } = require('sequelize');

// All routes require admin
router.use(auth);
router.use(roleCheck(['admin']));

// GET /api/dashboard/stats
router.get('/stats', async (req, res, next) => {
  try {
    const [
      totalStudents,
      totalSubmissions,
      totalMatches,
      totalMismatches,
      fraudAlerts,
      totalRevenue
    ] = await Promise.all([
      Student.count(),
      EmployeeSubmission.count(),
      VerificationResult.count({ where: { match_status: 'MATCH' } }),
      VerificationResult.count({ where: { match_status: 'MISMATCH' } }),
      VerificationResult.count({ where: { fraud_level: 'HIGH_RISK' } }),
      Student.sum('payment_amount')
    ]);

    return res.json({
      success: true,
      message: 'Dashboard stats retrieved successfully',
      data: {
        totalStudents,
        totalSubmissions,
        totalMatches,
        totalMismatches,
        fraudAlerts,
        totalRevenue: totalRevenue || 0
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/dashboard/enrollment-trend
router.get('/enrollment-trend', async (req, res, next) => {
  try {
    // Get last 12 months of enrollment data
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const results = await Student.findAll({
      attributes: [
        [fn('strftime', '%Y-%m', col('created_at')), 'month'],
        [fn('COUNT', col('id')), 'count']
      ],
      where: {
        created_at: { [Op.gte]: twelveMonthsAgo }
      },
      group: [fn('strftime', '%Y-%m', col('created_at'))],
      order: [[fn('strftime', '%Y-%m', col('created_at')), 'ASC']],
      raw: true
    });

    return res.json({
      success: true,
      message: 'Enrollment trend retrieved successfully',
      data: results.map((r) => ({
        month: r.month,
        count: parseInt(r.count, 10)
      }))
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/dashboard/revenue
router.get('/revenue', async (req, res, next) => {
  try {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const results = await Student.findAll({
      attributes: [
        [fn('strftime', '%Y-%m', col('created_at')), 'month'],
        [fn('SUM', col('payment_amount')), 'amount']
      ],
      where: {
        created_at: { [Op.gte]: twelveMonthsAgo }
      },
      group: [fn('strftime', '%Y-%m', col('created_at'))],
      order: [[fn('strftime', '%Y-%m', col('created_at')), 'ASC']],
      raw: true
    });

    return res.json({
      success: true,
      message: 'Revenue data retrieved successfully',
      data: results.map((r) => ({
        month: r.month,
        amount: parseFloat(r.amount) || 0
      }))
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/dashboard/accuracy
router.get('/accuracy', async (req, res, next) => {
  try {
    // Get all employees
    const employees = await Employee.findAll({
      where: { role: 'employee' },
      attributes: ['id', 'name']
    });

    const accuracyData = await Promise.all(
      employees.map(async (emp) => {
        // Count total submissions for this employee
        const totalSubmissions = await EmployeeSubmission.count({
          where: { employee_id: emp.id }
        });

        // Get reference IDs for this employee's submissions
        const submissions = await EmployeeSubmission.findAll({
          where: { employee_id: emp.id },
          attributes: ['reference_id'],
          raw: true
        });

        const referenceIds = submissions.map((s) => s.reference_id);

        // Count matches
        let matchCount = 0;
        if (referenceIds.length > 0) {
          matchCount = await VerificationResult.count({
            where: {
              reference_id: { [Op.in]: referenceIds },
              match_status: 'MATCH'
            }
          });
        }

        const accuracy = totalSubmissions > 0
          ? Math.round((matchCount / totalSubmissions) * 100)
          : 0;

        return {
          name: emp.name,
          total: totalSubmissions,
          matches: matchCount,
          accuracy
        };
      })
    );

    return res.json({
      success: true,
      message: 'Accuracy data retrieved successfully',
      data: accuracyData
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/dashboard/fraud-analytics
router.get('/fraud-analytics', async (req, res, next) => {
  try {
    // Distribution of fraud levels
    const [safe, review, highRisk] = await Promise.all([
      VerificationResult.count({ where: { fraud_level: 'SAFE' } }),
      VerificationResult.count({ where: { fraud_level: 'REVIEW_REQUIRED' } }),
      VerificationResult.count({ where: { fraud_level: 'HIGH_RISK' } })
    ]);

    // Monthly fraud counts (fraud_score > 20) for last 12 months
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const monthly = await VerificationResult.findAll({
      attributes: [
        [fn('strftime', '%Y-%m', col('verified_at')), 'month'],
        [fn('COUNT', col('id')), 'count']
      ],
      where: {
        fraud_score: { [Op.gt]: 20 },
        verified_at: { [Op.gte]: twelveMonthsAgo }
      },
      group: [fn('strftime', '%Y-%m', col('verified_at'))],
      order: [[fn('strftime', '%Y-%m', col('verified_at')), 'ASC']],
      raw: true
    });

    return res.json({
      success: true,
      message: 'Fraud analytics retrieved successfully',
      data: {
        distribution: { safe, review, highRisk },
        monthly: monthly.map((m) => ({
          month: m.month,
          count: parseInt(m.count, 10)
        }))
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/dashboard/match-distribution
router.get('/match-distribution', async (req, res, next) => {
  try {
    const [matches, mismatches, pending] = await Promise.all([
      VerificationResult.count({ where: { match_status: 'MATCH' } }),
      VerificationResult.count({ where: { match_status: 'MISMATCH' } }),
      VerificationResult.count({ where: { match_status: 'PENDING' } })
    ]);

    return res.json({
      success: true,
      message: 'Match distribution retrieved successfully',
      data: { matches, mismatches, pending }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
