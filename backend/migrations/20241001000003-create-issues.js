'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('issues', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      api_doc_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'api_docs', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT', // không xóa issue khi api_doc bị xóa (soft delete)
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      priority: {
        type: Sequelize.ENUM('Low', 'Medium', 'High'),
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('Open', 'In Progress', 'Resolved', 'Closed', 'Reopened'),
        allowNull: false,
        defaultValue: 'Open',
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      assigned_to: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
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
    });

    await queryInterface.addIndex('issues', ['api_doc_id'], { name: 'idx_issues_api_doc_id' });
    await queryInterface.addIndex('issues', ['status'], { name: 'idx_issues_status' });
    await queryInterface.addIndex('issues', ['priority'], { name: 'idx_issues_priority' });
    await queryInterface.addIndex('issues', ['created_by'], { name: 'idx_issues_created_by' });
    await queryInterface.addIndex('issues', ['assigned_to'], { name: 'idx_issues_assigned_to' });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('issues');
  },
};
