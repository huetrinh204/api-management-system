'use strict';

const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const SALT_ROUNDS = 10;

    const users = [
      {
        name: 'Alice (BA)',
        email: 'ba@example.com',
        password_hash: await bcrypt.hash('password123', SALT_ROUNDS),
        role: 'BA',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Bob (Backend Dev)',
        email: 'backend@example.com',
        password_hash: await bcrypt.hash('password123', SALT_ROUNDS),
        role: 'Backend Developer',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Carol (Frontend Dev)',
        email: 'frontend@example.com',
        password_hash: await bcrypt.hash('password123', SALT_ROUNDS),
        role: 'Frontend Developer',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Dave (Tester)',
        email: 'tester@example.com',
        password_hash: await bcrypt.hash('password123', SALT_ROUNDS),
        role: 'Tester',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    await queryInterface.bulkInsert('users', users, {});
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('users', {
      email: {
        [require('sequelize').Op.in]: [
          'ba@example.com',
          'backend@example.com',
          'frontend@example.com',
          'tester@example.com',
        ],
      },
    });
  },
};
