'use strict';

const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if admin already exists
    const [results] = await queryInterface.sequelize.query(
      "SELECT id FROM users WHERE role = 'Admin' LIMIT 1"
    );

    if (results.length > 0) {
      console.log('Admin user already exists. Skipping seed.');
      return;
    }

    // Get admin credentials from environment variables or use defaults
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@apihub.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';
    const adminName = process.env.ADMIN_NAME || 'System Administrator';

    // Hash password
    const password_hash = await bcrypt.hash(adminPassword, 10);

    // Insert admin user
    await queryInterface.bulkInsert('users', [
      {
        name: adminName,
        email: adminEmail,
        password_hash: password_hash,
        role: 'Admin',
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    console.log('='.repeat(60));
    console.log('Admin user created successfully!');
    console.log('='.repeat(60));
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    console.log('='.repeat(60));
    console.log('IMPORTANT: Please change the admin password after first login!');
    console.log('='.repeat(60));
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', { role: 'Admin' }, {});
  },
};
