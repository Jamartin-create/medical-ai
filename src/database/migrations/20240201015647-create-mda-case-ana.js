'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('mdaCaseAnas', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      uid: {
        type: Sequelize.STRING
      },
      caseid: {
        type: Sequelize.STRING
      },
      helpful: {
        type: Sequelize.INTEGER
      },
      type: {
        type: Sequelize.INTEGER
      },
      advice: {
        type: Sequelize.TEXT
      },
      diseases: {
        type: Sequelize.TEXT
      },
      reasons: {
        type: Sequelize.TEXT
      },
      status: {
        type: Sequelize.INTEGER
      },
      genAt: {
        type: Sequelize.DATE
      },
      createdAt: {
        type: Sequelize.DATE
      },
      updatedAt: {
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('mdaCaseAnas');
  }
};