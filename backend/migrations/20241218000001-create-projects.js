'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('projects', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      code: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: null,
      },
      color: {
        type: Sequelize.STRING(7),
        allowNull: true,
        defaultValue: null,
      },
      status: {
        type: Sequelize.ENUM('Active', 'Archived'),
        allowNull: false,
        defaultValue: 'Active',
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null,
      },
    });

    // Add indexes
    await queryInterface.addIndex('projects', ['name'], { name: 'idx_projects_name' });
    await queryInterface.addIndex('projects', ['code'], { name: 'idx_projects_code', unique: true });
    await queryInterface.addIndex('projects', ['status'], { name: 'idx_projects_status' });
    await queryInterface.addIndex('projects', ['deletedAt'], { name: 'idx_projects_deleted_at' });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('projects');
  },
};
