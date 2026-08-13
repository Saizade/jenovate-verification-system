const sequelize = require('../config/database');
const Employee = require('./Employee');
const Student = require('./Student');
const EmployeeSubmission = require('./EmployeeSubmission');
const VerificationResult = require('./VerificationResult');
const Notification = require('./Notification');

// Associations
Employee.hasMany(EmployeeSubmission, {
  foreignKey: 'employee_id',
  as: 'submissions'
});

EmployeeSubmission.belongsTo(Employee, {
  foreignKey: 'employee_id',
  as: 'employee'
});

Student.belongsTo(Employee, {
  foreignKey: 'submitted_by',
  as: 'submittedBy',
  constraints: false
});

module.exports = {
  sequelize,
  Employee,
  Student,
  EmployeeSubmission,
  VerificationResult,
  Notification
};
