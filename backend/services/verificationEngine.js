const { Student, EmployeeSubmission, VerificationResult, Notification } = require('../models');
const { calculateScore } = require('./fraudDetection');

const verify = async (referenceId) => {
  // 1. Find Student by reference_id
  const student = await Student.findOne({
    where: { reference_id: referenceId }
  });

  // 2. Find EmployeeSubmission by reference_id (latest one)
  const submission = await EmployeeSubmission.findOne({
    where: { reference_id: referenceId },
    order: [['created_at', 'DESC']]
  });

  // 3. If either missing, return PENDING
  if (!student || !submission) {
    const pendingResult = await upsertResult(referenceId, {
      match_status: 'PENDING',
      difference_amount: 0,
      fraud_score: 0,
      fraud_level: 'SAFE',
      field_details: {},
      remarks: !student
        ? 'Student record not found'
        : 'Employee submission not found',
      verified_at: new Date()
    });
    return pendingResult;
  }

  // 4. Compare fields
  const fieldDetails = {};

  // student_name comparison (case-insensitive, trimmed)
  const studentName = (student.full_name || '').trim().toLowerCase();
  const submissionName = (submission.student_name || '').trim().toLowerCase();
  fieldDetails.student_name = {
    student_value: student.full_name || '',
    employee_value: submission.student_name || '',
    match: studentName === submissionName
  };

  // course_name comparison (case-insensitive, trimmed)
  const studentCourse = (student.course_name || '').trim().toLowerCase();
  const submissionCourse = (submission.course_name || '').trim().toLowerCase();
  fieldDetails.course_name = {
    student_value: student.course_name || '',
    employee_value: submission.course_name || '',
    match: studentCourse === submissionCourse
  };

  // payment_amount comparison (numeric)
  const studentPayment = parseFloat(student.payment_amount) || 0;
  const submissionPayment = parseFloat(submission.payment_amount) || 0;
  fieldDetails.payment_amount = {
    student_value: studentPayment,
    employee_value: submissionPayment,
    match: studentPayment === submissionPayment
  };

  // joining_date comparison (string date)
  const studentDate = student.joining_date
    ? String(student.joining_date)
    : '';
  const submissionDate = submission.joining_date
    ? String(submission.joining_date)
    : '';
  fieldDetails.joining_date = {
    student_value: studentDate,
    employee_value: submissionDate,
    match: studentDate === submissionDate
  };

  // 5. Determine overall match status
  const allMatch = Object.values(fieldDetails).every((f) => f.match);
  const matchStatus = allMatch ? 'MATCH' : 'MISMATCH';

  // 6. Calculate difference amount
  const differenceAmount = Math.abs(studentPayment - submissionPayment);

  // 7. Calculate fraud score
  const { score: fraudScore, level: fraudLevel } = await calculateScore(
    fieldDetails,
    referenceId
  );

  // 8. Build remarks
  const mismatchedFields = Object.entries(fieldDetails)
    .filter(([, detail]) => !detail.match)
    .map(([field]) => field);

  let remarks = '';
  if (matchStatus === 'MATCH') {
    remarks = 'All fields match. Verification successful.';
  } else {
    remarks = `Mismatch found in: ${mismatchedFields.join(', ')}`;
  }

  // 9. Upsert VerificationResult
  const result = await upsertResult(referenceId, {
    match_status: matchStatus,
    difference_amount: differenceAmount,
    fraud_score: fraudScore,
    fraud_level: fraudLevel,
    field_details: fieldDetails,
    remarks,
    verified_at: new Date()
  });

  // 10. Create notifications if mismatch or HIGH_RISK fraud
  if (matchStatus === 'MISMATCH') {
    await Notification.create({
      type: 'mismatch',
      title: 'Data Mismatch Detected',
      message: `Mismatch detected for reference ${referenceId}. Mismatched fields: ${mismatchedFields.join(', ')}`,
      reference_id: referenceId,
      is_read: false,
      user_id: null // Notify all admins
    });
  }

  if (fraudLevel === 'HIGH_RISK') {
    await Notification.create({
      type: 'fraud',
      title: 'High Risk Fraud Alert',
      message: `High fraud risk (score: ${fraudScore}) detected for reference ${referenceId}`,
      reference_id: referenceId,
      is_read: false,
      user_id: null // Notify all admins
    });
  }

  // 11. Return the result
  return result;
};

/**
 * Upsert verification result - update if exists, create if not
 */
const upsertResult = async (referenceId, data) => {
  let result = await VerificationResult.findOne({
    where: { reference_id: referenceId }
  });

  if (result) {
    await result.update(data);
    return result;
  }

  result = await VerificationResult.create({
    reference_id: referenceId,
    ...data
  });

  return result;
};

module.exports = { verify };
