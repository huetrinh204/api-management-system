'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Step 1: Add is_active column
    await queryInterface.addColumn('users', 'is_active', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      after: 'role',
    });

    // Step 2: Modify ENUM to include 'Admin'
    // MySQL doesn't support direct ENUM modification, so we need to use ALTER TABLE
    await queryInterface.sequelize.query(`
      ALTER TABLE users 
      MODIFY COLUMN role ENUM('Admin', 'BA', 'Backend Developer', 'Frontend Developer', 'Tester') 
      NOT NULL
    `);

    // Step 3: Add index on is_active for faster queries
    await queryInterface.addIndex('users', ['is_active'], {
      name: 'idx_users_is_active',
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove index
    await queryInterface.removeIndex('users', 'idx_users_is_active');

    // Remove is_active column
    await queryInterface.removeColumn('users', 'is_active');

    // Restore original ENUM (remove Admin)
    await queryInterface.sequelize.query(`
      ALTER TABLE users 
      MODIFY COLUMN role ENUM('BA', 'Backend Developer', 'Frontend Developer', 'Tester') 
      NOT NULL
    `);
  },
};
