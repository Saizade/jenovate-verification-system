const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Student = sequelize.define('Student', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  reference_id: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  full_name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Full name is required' }
    }
  },
  dob: {
    type: DataTypes.DATEONLY
  },
  gender: {
    type: DataTypes.ENUM('male', 'female', 'other')
  },
  mobile: {
    type: DataTypes.STRING
  },
  email: {
    type: DataTypes.STRING,
    validate: {
      isEmail: { msg: 'Invalid email format' }
    }
  },
  father_name: {
    type: DataTypes.STRING
  },
  mother_name: {
    type: DataTypes.STRING
  },
  number_of_siblings: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  guardian_details: {
    type: DataTypes.TEXT
  },
  state: {
    type: DataTypes.STRING
  },
  city: {
    type: DataTypes.STRING
  },
  full_address: {
    type: DataTypes.TEXT
  },
  qualification: {
    type: DataTypes.STRING
  },
  previous_education: {
    type: DataTypes.STRING
  },
  course_name: {
    type: DataTypes.STRING
  },
  course_fee: {
    type: DataTypes.DECIMAL(10, 2)
  },
  payment_amount: {
    type: DataTypes.DECIMAL(10, 2)
  },
  payment_mode: {
    type: DataTypes.STRING
  },
  transaction_id: {
    type: DataTypes.STRING
  },
  joining_date: {
    type: DataTypes.DATEONLY
  },
  documents: {
    type: DataTypes.JSON,
    defaultValue: {}
  },
  is_locked: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  submitted_by: {
    type: DataTypes.INTEGER
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'students',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['reference_id']
    }
  ]
});

module.exports = Student;
