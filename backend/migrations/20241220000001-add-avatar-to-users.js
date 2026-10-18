'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'avatar_url', {
      type: Sequelize.STRING(500),
      allowNull: true,
      after: 'is_active',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'avatar_url');
  },
};
