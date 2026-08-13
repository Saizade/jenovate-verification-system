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

// ─── Shared Filter Builder ───────────────────────────────────────────
// Builds a Sequelize where clause from common query params.
// All deep-analytics endpoints reuse this for consistency.
function buildStudentFilter(query) {
  const { state, paymentStatus, course, counselor, department, college, dateFrom, dateTo, search, monthOpted, month } = query;
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

  if (state) {
    where.state = { [Op.like]: `%${state}%` };
  }

  if (course) {
    where.course_opted = { [Op.like]: `%${course}%` };
  }

  if (counselor) {
    where.counselor_name = { [Op.like]: `%${counselor}%` };
  }

  if (department) {
    where.department = { [Op.like]: `%${department}%` };
  }

  if (college) {
    where.college_name = { [Op.like]: `%${college}%` };
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

  return where;
}

// ─── 1. GET /api/dashboard/stats ─────────────────────────────────────
// Basic overview stats (no filters, backward compatible)
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
      Student.sum('amount_received')
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

// ─── 2. GET /api/dashboard/deep-stats ────────────────────────────────
// Returns all key metrics, filtered by state / paymentStatus / course / etc.
router.get('/deep-stats', async (req, res, next) => {
  try {
    const where = buildStudentFilter(req.query);

    const [
      totalStudents,
      totalCollected,
      totalPending,
      totalProgramValue,
      pendingStudentsCount,
      paidStudentsCount
    ] = await Promise.all([
      Student.count({ where }),
      Student.sum('amount_received', { where }),
      Student.sum('pending_amount', { where }),
      Student.sum('program_price', { where }),
      Student.count({ where: { ...where, pending_amount: { [Op.gt]: 0 } } }),
      Student.count({
        where: {
          ...where,
          [Op.or]: [
            { pending_amount: { [Op.lte]: 0 } },
            { pending_amount: null }
          ]
        }
      })
    ]);

    const avgProgramPrice = totalStudents > 0 ? (totalProgramValue || 0) / totalStudents : 0;
    const avgPendingAmount = pendingStudentsCount > 0 ? (totalPending || 0) / pendingStudentsCount : 0;

    return res.json({
      success: true,
      message: 'Deep stats retrieved successfully',
      data: {
        totalStudents,
        totalCollected: totalCollected || 0,
        totalPending: totalPending || 0,
        totalProgramValue: totalProgramValue || 0,
        pendingStudentsCount,
        paidStudentsCount,
        avgProgramPrice: Math.round(avgProgramPrice),
        avgPendingAmount: Math.round(avgPendingAmount)
      }
    });
  } catch (error) {
    next(error);
  }
});

// ─── 3. GET /api/dashboard/enrollment-trend ──────────────────────────
router.get('/enrollment-trend', async (req, res, next) => {
  try {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const where = buildStudentFilter(req.query);
    where.created_at = { ...(where.created_at || {}), [Op.gte]: twelveMonthsAgo };

    const results = await Student.findAll({
      attributes: [
        [fn('strftime', '%Y-%m', col('created_at')), 'month'],
        [fn('COUNT', col('id')), 'count']
      ],
      where,
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

// ─── 4. GET /api/dashboard/revenue ───────────────────────────────────
router.get('/revenue', async (req, res, next) => {
  try {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const where = buildStudentFilter(req.query);
    where.created_at = { ...(where.created_at || {}), [Op.gte]: twelveMonthsAgo };

    const results = await Student.findAll({
      attributes: [
        [fn('strftime', '%Y-%m', col('created_at')), 'month'],
        [fn('SUM', col('amount_received')), 'amount']
      ],
      where,
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

// ─── 5. GET /api/dashboard/accuracy ──────────────────────────────────
router.get('/accuracy', async (req, res, next) => {
  try {
    const employees = await Employee.findAll({
      where: { role: 'employee' },
      attributes: ['id', 'name']
    });

    const accuracyData = await Promise.all(
      employees.map(async (emp) => {
        const totalSubmissions = await EmployeeSubmission.count({
          where: { employee_id: emp.id }
        });

        const submissions = await EmployeeSubmission.findAll({
          where: { employee_id: emp.id },
          attributes: ['reference_id'],
          raw: true
        });

        const referenceIds = submissions.map((s) => s.reference_id);

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

// ─── 6. GET /api/dashboard/fraud-analytics ───────────────────────────
router.get('/fraud-analytics', async (req, res, next) => {
  try {
    const [safe, review, highRisk] = await Promise.all([
      VerificationResult.count({ where: { fraud_level: 'SAFE' } }),
      VerificationResult.count({ where: { fraud_level: 'REVIEW_REQUIRED' } }),
      VerificationResult.count({ where: { fraud_level: 'HIGH_RISK' } })
    ]);

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

// ─── 7. GET /api/dashboard/state-breakdown ───────────────────────────
router.get('/state-breakdown', async (req, res, next) => {
  try {
    const where = buildStudentFilter(req.query);

    const results = await Student.findAll({
      attributes: [
        [fn('COALESCE', col('state'), 'Not Specified'), 'state'],
        [fn('COUNT', col('id')), 'count'],
        [fn('SUM', col('amount_received')), 'totalCollected'],
        [fn('SUM', col('pending_amount')), 'totalPending']
      ],
      where,
      group: [fn('COALESCE', col('state'), 'Not Specified')],
      order: [[fn('COUNT', col('id')), 'DESC']],
      raw: true
    });

    return res.json({
      success: true,
      message: 'State breakdown retrieved successfully',
      data: results.map((r) => ({
        state: r.state,
        count: parseInt(r.count, 10),
        totalCollected: parseFloat(r.totalCollected) || 0,
        totalPending: parseFloat(r.totalPending) || 0
      }))
    });
  } catch (error) {
    next(error);
  }
});

// ─── 8. GET /api/dashboard/payment-analytics ─────────────────────────
router.get('/payment-analytics', async (req, res, next) => {
  try {
    const where = buildStudentFilter(req.query);

    const [totalCollected, totalPending, pendingStudentsCount, paidStudentsCount] = await Promise.all([
      Student.sum('amount_received', { where }),
      Student.sum('pending_amount', { where }),
      Student.count({ where: { ...where, pending_amount: { [Op.gt]: 0 } } }),
      Student.count({ where: { ...where, [Op.or]: [{ pending_amount: { [Op.lte]: 0 } }, { pending_amount: null }] } })
    ]);

    return res.json({
      success: true,
      message: 'Payment analytics retrieved successfully',
      data: {
        totalCollected: totalCollected || 0,
        totalPending: totalPending || 0,
        pendingStudentsCount: pendingStudentsCount || 0,
        paidStudentsCount: paidStudentsCount || 0
      }
    });
  } catch (error) {
    next(error);
  }
});

// ─── 9. GET /api/dashboard/states ────────────────────────────────────
router.get('/states', async (req, res, next) => {
  try {
    const results = await Student.findAll({
      attributes: [[sequelize.fn('DISTINCT', sequelize.col('state')), 'state']],
      where: { state: { [Op.ne]: null } },
      raw: true
    });

    const states = results.map(r => r.state).filter(Boolean);

    return res.json({
      success: true,
      data: states
    });
  } catch (error) {
    next(error);
  }
});

// ─── 10. GET /api/dashboard/course-breakdown ─────────────────────────
// Students grouped by course_opted with revenue & pending totals
router.get('/course-breakdown', async (req, res, next) => {
  try {
    const where = buildStudentFilter(req.query);

    const results = await Student.findAll({
      attributes: [
        [fn('COALESCE', col('course_opted'), 'Not Specified'), 'course'],
        [fn('COUNT', col('id')), 'count'],
        [fn('SUM', col('amount_received')), 'totalCollected'],
        [fn('SUM', col('pending_amount')), 'totalPending']
      ],
      where,
      group: [fn('COALESCE', col('course_opted'), 'Not Specified')],
      order: [[fn('COUNT', col('id')), 'DESC']],
      raw: true
    });

    return res.json({
      success: true,
      message: 'Course breakdown retrieved successfully',
      data: results.map((r) => ({
        course: r.course,
        count: parseInt(r.count, 10),
        totalCollected: parseFloat(r.totalCollected) || 0,
        totalPending: parseFloat(r.totalPending) || 0
      }))
    });
  } catch (error) {
    next(error);
  }
});

// ─── 11. GET /api/dashboard/counselor-performance ────────────────────
// Student count, revenue, pending grouped by counselor_name
router.get('/counselor-performance', async (req, res, next) => {
  try {
    const where = buildStudentFilter(req.query);

    const results = await Student.findAll({
      attributes: [
        [fn('COALESCE', col('counselor_name'), 'Not Assigned'), 'counselor'],
        [fn('COUNT', col('id')), 'count'],
        [fn('SUM', col('amount_received')), 'totalCollected'],
        [fn('SUM', col('pending_amount')), 'totalPending'],
        [fn('SUM', col('program_price')), 'totalProgramValue']
      ],
      where,
      group: [fn('COALESCE', col('counselor_name'), 'Not Assigned')],
      order: [[fn('COUNT', col('id')), 'DESC']],
      raw: true
    });

    return res.json({
      success: true,
      message: 'Counselor performance retrieved successfully',
      data: results.map((r) => ({
        counselor: r.counselor,
        count: parseInt(r.count, 10),
        totalCollected: parseFloat(r.totalCollected) || 0,
        totalPending: parseFloat(r.totalPending) || 0,
        totalProgramValue: parseFloat(r.totalProgramValue) || 0
      }))
    });
  } catch (error) {
    next(error);
  }
});

// ─── 12. GET /api/dashboard/college-breakdown ────────────────────────
// Students grouped by college_name with revenue totals
router.get('/college-breakdown', async (req, res, next) => {
  try {
    const where = buildStudentFilter(req.query);

    const results = await Student.findAll({
      attributes: [
        [fn('COALESCE', col('college_name'), 'Not Specified'), 'college'],
        [fn('COUNT', col('id')), 'count'],
        [fn('SUM', col('amount_received')), 'totalCollected'],
        [fn('SUM', col('pending_amount')), 'totalPending']
      ],
      where,
      group: [fn('COALESCE', col('college_name'), 'Not Specified')],
      order: [[fn('COUNT', col('id')), 'DESC']],
      limit: 25,
      raw: true
    });

    return res.json({
      success: true,
      message: 'College breakdown retrieved successfully',
      data: results.map((r) => ({
        college: r.college,
        count: parseInt(r.count, 10),
        totalCollected: parseFloat(r.totalCollected) || 0,
        totalPending: parseFloat(r.totalPending) || 0
      }))
    });
  } catch (error) {
    next(error);
  }
});

// ─── 13. GET /api/dashboard/payment-mode-breakdown ───────────────────
// Students grouped by payment_mode
router.get('/payment-mode-breakdown', async (req, res, next) => {
  try {
    const where = buildStudentFilter(req.query);

    const results = await Student.findAll({
      attributes: [
        [fn('COALESCE', col('payment_mode'), 'Not Specified'), 'mode'],
        [fn('COUNT', col('id')), 'count'],
        [fn('SUM', col('amount_received')), 'totalCollected']
      ],
      where,
      group: [fn('COALESCE', col('payment_mode'), 'Not Specified')],
      order: [[fn('COUNT', col('id')), 'DESC']],
      raw: true
    });

    return res.json({
      success: true,
      message: 'Payment mode breakdown retrieved successfully',
      data: results.map((r) => ({
        mode: r.mode,
        count: parseInt(r.count, 10),
        totalCollected: parseFloat(r.totalCollected) || 0
      }))
    });
  } catch (error) {
    next(error);
  }
});

// ─── 14. GET /api/dashboard/department-breakdown ─────────────────────
// Students grouped by department
router.get('/department-breakdown', async (req, res, next) => {
  try {
    const where = buildStudentFilter(req.query);

    const results = await Student.findAll({
      attributes: [
        [fn('COALESCE', col('department'), 'Not Specified'), 'department'],
        [fn('COUNT', col('id')), 'count'],
        [fn('SUM', col('amount_received')), 'totalCollected'],
        [fn('SUM', col('pending_amount')), 'totalPending']
      ],
      where,
      group: [fn('COALESCE', col('department'), 'Not Specified')],
      order: [[fn('COUNT', col('id')), 'DESC']],
      raw: true
    });

    return res.json({
      success: true,
      message: 'Department breakdown retrieved successfully',
      data: results.map((r) => ({
        department: r.department,
        count: parseInt(r.count, 10),
        totalCollected: parseFloat(r.totalCollected) || 0,
        totalPending: parseFloat(r.totalPending) || 0
      }))
    });
  } catch (error) {
    next(error);
  }
});

// ─── 15. GET /api/dashboard/monthly-collection ───────────────────────
// Month-wise collected vs pending trend (dual series)
router.get('/monthly-collection', async (req, res, next) => {
  try {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const where = buildStudentFilter(req.query);
    where.created_at = { ...(where.created_at || {}), [Op.gte]: twelveMonthsAgo };

    const results = await Student.findAll({
      attributes: [
        [fn('strftime', '%Y-%m', col('created_at')), 'month'],
        [fn('SUM', col('amount_received')), 'collected'],
        [fn('SUM', col('pending_amount')), 'pending'],
        [fn('COUNT', col('id')), 'studentCount']
      ],
      where,
      group: [fn('strftime', '%Y-%m', col('created_at'))],
      order: [[fn('strftime', '%Y-%m', col('created_at')), 'ASC']],
      raw: true
    });

    return res.json({
      success: true,
      message: 'Monthly collection trend retrieved successfully',
      data: results.map((r) => ({
        month: r.month,
        collected: parseFloat(r.collected) || 0,
        pending: parseFloat(r.pending) || 0,
        studentCount: parseInt(r.studentCount, 10)
      }))
    });
  } catch (error) {
    next(error);
  }
});

// ─── 16. GET /api/dashboard/top-defaulters ───────────────────────────
// Top students with highest pending amounts
router.get('/top-defaulters', async (req, res, next) => {
  try {
    const where = buildStudentFilter(req.query);
    where.pending_amount = { [Op.gt]: 0 };

    const limit = parseInt(req.query.limit) || 20;

    const students = await Student.findAll({
      where,
      order: [['pending_amount', 'DESC']],
      limit,
      attributes: [
        'id', 'reference_id', 'full_name', 'state', 'college_name',
        'course_opted', 'counselor_name', 'phone_no', 'email',
        'program_price', 'amount_received', 'pending_amount', 'payment_mode', 'date'
      ],
      raw: true
    });

    return res.json({
      success: true,
      message: 'Top defaulters retrieved successfully',
      data: students
    });
  } catch (error) {
    next(error);
  }
});

// ─── 17. GET /api/dashboard/batch-breakdown ─────────────────────────
// Groups students by month_opted and course_opted
router.get('/batch-breakdown', async (req, res, next) => {
  try {
    const where = buildStudentFilter(req.query);

    const batches = await Student.findAll({
      attributes: [
        [fn('COALESCE', col('month_opted'), 'Unspecified Month'), 'month_opted'],
        [fn('COALESCE', col('course_opted'), 'Unspecified Course'), 'course_opted'],
        [fn('COUNT', col('id')), 'totalStudents'],
        [fn('SUM', col('amount_received')), 'totalCollected'],
        [fn('SUM', col('pending_amount')), 'totalPending']
      ],
      where,
      group: [
        fn('COALESCE', col('month_opted'), 'Unspecified Month'),
        fn('COALESCE', col('course_opted'), 'Unspecified Course')
      ],
      order: [
        [fn('COALESCE', col('month_opted'), 'Unspecified Month'), 'ASC'],
        [fn('COUNT', col('id')), 'DESC']
      ],
      raw: true
    });

    return res.json({
      success: true,
      data: batches.map(b => ({
        monthOpted: b.month_opted,
        courseOpted: b.course_opted,
        totalStudents: parseInt(b.totalStudents, 10) || 0,
        totalCollected: parseFloat(b.totalCollected) || 0,
        totalPending: parseFloat(b.totalPending) || 0
      }))
    });
  } catch (error) {
    next(error);
  }
});

// ─── 18. GET /api/dashboard/filter-options ───────────────────────────
// Returns distinct values for all filterable fields (dynamic dropdowns)
router.get('/filter-options', async (req, res, next) => {
  try {
    const [states, courses, counselors, departments, colleges, paymentModes, months] = await Promise.all([
      Student.findAll({
        attributes: [[fn('DISTINCT', col('state')), 'value']],
        where: { state: { [Op.ne]: null, [Op.ne]: '' } },
        raw: true
      }),
      Student.findAll({
        attributes: [[fn('DISTINCT', col('course_opted')), 'value']],
        where: { course_opted: { [Op.ne]: null, [Op.ne]: '' } },
        raw: true
      }),
      Student.findAll({
        attributes: [[fn('DISTINCT', col('counselor_name')), 'value']],
        where: { counselor_name: { [Op.ne]: null, [Op.ne]: '' } },
        raw: true
      }),
      Student.findAll({
        attributes: [[fn('DISTINCT', col('department')), 'value']],
        where: { department: { [Op.ne]: null, [Op.ne]: '' } },
        raw: true
      }),
      Student.findAll({
        attributes: [[fn('DISTINCT', col('college_name')), 'value']],
        where: { college_name: { [Op.ne]: null, [Op.ne]: '' } },
        raw: true
      }),
      Student.findAll({
        attributes: [[fn('DISTINCT', col('payment_mode')), 'value']],
        where: { payment_mode: { [Op.ne]: null, [Op.ne]: '' } },
        raw: true
      }),
      Student.findAll({
        attributes: [[fn('DISTINCT', col('month_opted')), 'value']],
        where: { month_opted: { [Op.ne]: null, [Op.ne]: '' } },
        raw: true
      })
    ]);

    return res.json({
      success: true,
      data: {
        states: states.map(r => r.value).filter(Boolean).sort(),
        courses: courses.map(r => r.value).filter(Boolean).sort(),
        counselors: counselors.map(r => r.value).filter(Boolean).sort(),
        departments: departments.map(r => r.value).filter(Boolean).sort(),
        colleges: colleges.map(r => r.value).filter(Boolean).sort(),
        paymentModes: paymentModes.map(r => r.value).filter(Boolean).sort(),
        months: months.map(r => r.value).filter(Boolean).sort()
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
