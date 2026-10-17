'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add project_id column to api_docs table
    await queryInterface.addColumn('api_docs', 'project_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: null,
      after: 'id',
    });

    // Add foreign key constraint
    await queryInterface.addConstraint('api_docs', {
      fields: ['project_id'],
      type: 'foreign key',
      name: 'fk_api_docs_project',
      references: {
        table: 'projects',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    // Add index for project_id
    await queryInterface.addIndex('api_docs', ['project_id'], {
      name: 'idx_api_docs_project_id',
    });
  },

  async down(queryInterface) {
    // Remove index first
    await queryInterface.removeIndex('api_docs', 'idx_api_docs_project_id');
    
    // Remove foreign key constraint
    await queryInterface.removeConstraint('api_docs', 'fk_api_docs_project');
    
    // Remove column
    await queryInterface.removeColumn('api_docs', 'project_id');
  },
};
