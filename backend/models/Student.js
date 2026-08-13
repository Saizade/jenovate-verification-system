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
  s_no: {
    type: DataTypes.STRING
  },
  remarks: {
    type: DataTypes.TEXT
  },
  date: {
    type: DataTypes.STRING
  },
  academic_remarks: {
    type: DataTypes.TEXT
  },
  counselor_name: {
    type: DataTypes.STRING
  },
  full_name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Full name is required' }
    }
  },
  phone_no: {
    type: DataTypes.STRING
  },
  whatsapp_number: {
    type: DataTypes.STRING
  },
  email: {
    type: DataTypes.STRING,
    validate: {
      isEmail: { msg: 'Invalid email format' }
    }
  },
  college_name: {
    type: DataTypes.STRING
  },
  state: {
    type: DataTypes.STRING
  },
  department: {
    type: DataTypes.STRING
  },
  course_opted: {
    type: DataTypes.STRING
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
  type_of_pack: {
    type: DataTypes.STRING
  },
  month_opted: {
    type: DataTypes.STRING
  },
  type_of_course: {
    type: DataTypes.STRING
  },
  payment_mode: {
    type: DataTypes.STRING
  },
  program_price: {
    type: DataTypes.DECIMAL(10, 2)
  },
  amount_received: {
    type: DataTypes.DECIMAL(10, 2)
  },
  pending_amount: {
    type: DataTypes.DECIMAL(10, 2)
  },
  revenue_channel: {
    type: DataTypes.STRING
  },
  // Backward compatibility getters for verification & dashboard helpers
  course_name: {
    type: DataTypes.VIRTUAL,
    get() {
      return this.getDataValue('course_opted') || '';
    }
  },
  payment_amount: {
    type: DataTypes.VIRTUAL,
    get() {
      return this.getDataValue('amount_received') || 0;
    }
  },
  joining_date: {
    type: DataTypes.VIRTUAL,
    get() {
      return this.getDataValue('date') || '';
    }
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
