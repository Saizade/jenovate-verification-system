const { Student, EmployeeSubmission, VerificationResult } = require('../models');

const seedStudents = async () => {
  try {
    // Clear all existing student data and submissions from the database
    await Student.destroy({ where: {} });
    await EmployeeSubmission.destroy({ where: {} });
    await VerificationResult.destroy({ where: {} });
    console.log('All existing student data cleared from system.');
  } catch (error) {
    console.error('Error clearing student data:', error);
  }
};

module.exports = seedStudents;
