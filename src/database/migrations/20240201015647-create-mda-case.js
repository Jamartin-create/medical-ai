'use strict'
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
            title: {
                type: Sequelize.STRING
            },
            summary: {
                type: Sequelize.TEXT
            },
            userid: {
                type: Sequelize.STRING
            },
            medical: {
                type: Sequelize.TEXT
            },
            mdHistory: {
                type: Sequelize.TEXT
            },
            status: {
                type: Sequelize.INTEGER
            },
            createdAt: {
                type: Sequelize.DATE
            },
            updatedAt: {
                type: Sequelize.DATE
            }
        })
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('mdaCases')
    }
}
