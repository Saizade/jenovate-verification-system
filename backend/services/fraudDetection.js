const { EmployeeSubmission } = require('../models');

const calculateScore = async (fieldDetails, referenceId) => {
  let score = 0;

  // Payment mismatch: +30 (scaled by percentage difference)
  if (fieldDetails.payment_amount && !fieldDetails.payment_amount.match) {
    const studentVal = parseFloat(fieldDetails.payment_amount.student_value) || 0;
    const employeeVal = parseFloat(fieldDetails.payment_amount.employee_value) || 0;

    if (studentVal > 0) {
      const percentDiff = (Math.abs(studentVal - employeeVal) / studentVal) * 100;
      // Scale the 30 points by the percentage difference
      const scaledScore = Math.round(30 * Math.min(percentDiff / 100, 1));
      score += Math.max(scaledScore, 10); // Minimum 10 if there's any mismatch
      if (percentDiff > 50) {
        score = Math.max(score, 30); // Full 30 points for >50% difference
      }
    } else {
      score += 30;
    }
  }

  // Course mismatch: +25
  if (fieldDetails.course_name && !fieldDetails.course_name.match) {
    score += 25;
  }

  // Name mismatch: +20
  if (fieldDetails.student_name && !fieldDetails.student_name.match) {
    score += 20;
  }

  // Date mismatch: +10
  if (fieldDetails.joining_date && !fieldDetails.joining_date.match) {
    score += 10;
  }

  // Check for duplicate submissions (multiple employee submissions for same reference): +15
  const duplicateCount = await EmployeeSubmission.count({
    where: { reference_id: referenceId }
  });
  if (duplicateCount > 1) {
    score += 15;
  }

  // Cap at 100
  score = Math.min(score, 100);

  // Determine fraud level
  let level = 'SAFE';
  if (score > 50) {
    level = 'HIGH_RISK';
  } else if (score > 20) {
    level = 'REVIEW_REQUIRED';
  }

  return { score, level };
};

module.exports = { calculateScore };
