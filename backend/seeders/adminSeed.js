const { Employee } = require('../models');

const seedAdmin = async () => {
  try {
    // 1. Seed Admin
    const adminExists = await Employee.findOne({ where: { role: 'admin' } });
    if (!adminExists) {
      await Employee.create({
        name: 'Admin User',
        email: 'admin@jenovate.com',
        password: 'Admin@123', // Will be hashed by the Employee model hook
        role: 'admin'
      });
      console.log('Default admin account seeded: admin@jenovate.com / Admin@123');
    } else {
      console.log('Admin account already exists, skipping admin seed.');
    }

    // 2. Seed Demo Employee
    const empExists = await Employee.findOne({ where: { email: 'employee@jenovate.com' } });
    if (!empExists) {
      await Employee.create({
        name: 'Demo Employee',
        email: 'employee@jenovate.com',
        password: 'Employee@123', // Will be hashed by the Employee model hook
        role: 'employee'
      });
      console.log('Demo employee account seeded: employee@jenovate.com / Employee@123');
    } else {
      console.log('Demo employee account already exists, skipping employee seed.');
    }
  } catch (error) {
    console.error('Error seeding users:', error);
  }
};

module.exports = seedAdmin;

