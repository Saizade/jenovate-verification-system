const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const EmployeeSubmission = sequelize.define('EmployeeSubmission', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  reference_id: {
    type: DataTypes.STRING,
    allowNull: false
  },
  employee_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  student_name: {
    type: DataTypes.STRING
  },
  course_name: {
    type: DataTypes.STRING
  },
  payment_amount: {
    type: DataTypes.DECIMAL(10, 2)
  },
  joining_date: {
    type: DataTypes.DATEONLY
  },
  remarks: {
    type: DataTypes.TEXT
  },
  is_locked: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'employee_submissions',
  timestamps: false,
  indexes: [
    {
      fields: ['reference_id']
    }
  ]
});

module.exports = EmployeeSubmission;
