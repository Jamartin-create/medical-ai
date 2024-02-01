'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('mdaCases', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      uid: {
        type: Sequelize.STRING
      },
      curSituation: {
        type: Sequelize.INTEGER
      },
      summary: {
        type: Sequelize.STRING
      },
      caseid: {
        type: Sequelize.STRING
      },
      medical: {
        type: Sequelize.STRING
      },
      mdHistory: {
        type: Sequelize.STRING
      },
      recordDate: {
        type: Sequelize.STRING
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
    await queryInterface.dropTable('mdaCases');
  }
};