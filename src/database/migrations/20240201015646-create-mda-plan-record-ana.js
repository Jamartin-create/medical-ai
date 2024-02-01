'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('mdaPlanRecordAnas', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      uid: {
        type: Sequelize.STRING
      },
      overviewid: {
        type: Sequelize.STRING
      },
      newsid: {
        type: Sequelize.STRING
      },
      summary: {
        type: Sequelize.STRING
      },
      helpful: {
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
    await queryInterface.dropTable('mdaPlanRecordAnas');
  }
};