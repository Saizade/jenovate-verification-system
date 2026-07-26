const { Employee } = require('../models');

const seedAdmin = async () => {
  try {
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
      console.log('Admin account already exists, skipping seed.');
    }
  } catch (error) {
    console.error('Error seeding admin user:', error);
  }
};

module.exports = seedAdmin;
