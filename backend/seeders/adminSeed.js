const { Employee } = require('../models');

const seedAdmin = async () => {
  try {
    // 1. Seed Admin
    const adminExists = await Employee.findOne({ where: { email: 'admin@jenovate.com' } });
    if (!adminExists) {
      await Employee.create({
        name: 'Admin User',
        email: 'admin@jenovate.com',
        password: 'Admin@123', // Will be hashed by the Employee model hook
        role: 'admin'
      });
      console.log('Default admin account seeded: admin@jenovate.com / Admin@123');
    } else {
      const isValid = await adminExists.validatePassword('Admin@123');
      if (!isValid) {
        adminExists.password = 'Admin@123';
        await adminExists.save();
        console.log('Admin password reset to default: Admin@123');
      } else {
        console.log('Admin account exists and password is valid.');
      }
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
      const isValid = await empExists.validatePassword('Employee@123');
      if (!isValid) {
        empExists.password = 'Employee@123';
        await empExists.save();
        console.log('Demo employee password reset to default: Employee@123');
      } else {
        console.log('Demo employee account exists and password is valid.');
      }
    }
  } catch (error) {
    console.error('Error seeding users:', error);
  }
};

module.exports = seedAdmin;

