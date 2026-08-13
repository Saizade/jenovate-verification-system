const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const VerificationResult = sequelize.define('VerificationResult', {
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
  match_status: {
    type: DataTypes.ENUM('MATCH', 'MISMATCH', 'PENDING'),
    defaultValue: 'PENDING'
  },
  difference_amount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  fraud_score: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  fraud_level: {
    type: DataTypes.ENUM('SAFE', 'REVIEW_REQUIRED', 'HIGH_RISK'),
    defaultValue: 'SAFE'
  },
  field_details: {
    type: DataTypes.JSON
  },
  remarks: {
    type: DataTypes.TEXT
  },
  verified_at: {
    type: DataTypes.DATE
  }
}, {
  tableName: 'verification_results',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['reference_id']
    }
  ]
});

module.exports = VerificationResult;
