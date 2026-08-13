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
  date: {
    type: DataTypes.STRING
  },
  student_name: {
    type: DataTypes.STRING
  },
  whatsapp_no: {
    type: DataTypes.STRING
  },
  email: {
    type: DataTypes.STRING
  },
  course_opted: {
    type: DataTypes.STRING
  },
  num_courses_selected: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  primary_course: {
    type: DataTypes.STRING
  },
  secondary_course: {
    type: DataTypes.STRING
  },
  tertiary_course: {
    type: DataTypes.STRING
  },
  fees_paid: {
    type: DataTypes.DECIMAL(10, 2)
  },
  program_price: {
    type: DataTypes.DECIMAL(10, 2)
  },
  pending_amount: {
    type: DataTypes.DECIMAL(10, 2)
  },
  payment_mode: {
    type: DataTypes.STRING
  },
  revenue_channel: {
    type: DataTypes.STRING
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
