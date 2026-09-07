const { Employee } = require('../models');

const seedAdmin = async () => {
  try {
    // Remove old demo accounts
    await Employee.destroy({
      where: {
        email: ['admin@jenovate.com', 'employee@jenovate.com']
      }
    });

    const targetEmail = 'shantanuhadge.pro@gmail.com';
    const targetPass = 'Pass@jenovate1234';

    // Seed/Update Admin Account
    let admin = await Employee.findOne({ where: { email: targetEmail } });
    if (!admin) {
      admin = await Employee.create({
        name: 'Shantanu Hadge',
        email: targetEmail,
        password: targetPass,
        role: 'admin'
      });
      console.log(`Admin account created: ${targetEmail}`);
    } else {
      admin.role = 'admin';
      admin.password = targetPass; // Will be re-hashed by beforeUpdate hook
      await admin.save();
      console.log(`Admin account updated: ${targetEmail}`);
    }
  } catch (error) {
    console.error('Error seeding users:', error);
  }
};

module.exports = seedAdmin;
