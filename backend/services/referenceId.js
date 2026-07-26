const { Student } = require('../models');
const { Op } = require('sequelize');

const generateReferenceId = async () => {
  const currentYear = new Date().getFullYear();
  const prefix = `JNV-${currentYear}-`;

  const lastStudent = await Student.findOne({
    where: {
      reference_id: {
        [Op.like]: `${prefix}%`
      }
    },
    order: [['reference_id', 'DESC']]
  });

  let nextNumber = 1;
  if (lastStudent) {
    const lastNumber = parseInt(lastStudent.reference_id.split('-').pop(), 10);
    if (!isNaN(lastNumber)) {
      nextNumber = lastNumber + 1;
    }
  }

  const paddedNumber = String(nextNumber).padStart(4, '0');
  return `${prefix}${paddedNumber}`;
};

module.exports = { generateReferenceId };
