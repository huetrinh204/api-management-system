'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('api_docs', {
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
      method: {
        type: Sequelize.ENUM('GET', 'POST', 'PUT', 'PATCH', 'DELETE'),
        allowNull: false,
      },
      endpoint: {
        type: Sequelize.STRING(500),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      request_sample: {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: null,
      },
      response_sample: {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: null,
      },
      status: {
        type: Sequelize.ENUM('Draft', 'Active', 'Deprecated'),
        allowNull: false,
        defaultValue: 'Draft',
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

    await queryInterface.addIndex('api_docs', ['name'], { name: 'idx_api_docs_name' });
    await queryInterface.addIndex('api_docs', ['endpoint'], { name: 'idx_api_docs_endpoint' });
    await queryInterface.addIndex('api_docs', ['deletedAt'], { name: 'idx_api_docs_deleted_at' });
    await queryInterface.addIndex('api_docs', ['status'], { name: 'idx_api_docs_status' });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('api_docs');
  },
};
