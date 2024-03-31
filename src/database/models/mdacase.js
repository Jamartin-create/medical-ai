'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
    class mdaCase extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }
    mdaCase.init(
        {
            uid: DataTypes.STRING,
            curSituation: DataTypes.INTEGER, // 当前状态：0=差、1=一般、2=好
            title: DataTypes.STRING, // 健康档案标题（由 AI 生成）
            summary: DataTypes.STRING, // 自我描述
            userid: DataTypes.STRING, // 用户 id
            medical: DataTypes.STRING, // 用药史
            mdHistory: DataTypes.STRING, // 病史
            status: DataTypes.INTEGER // 病情：0=病ing，1=痊愈
        },
        {
            sequelize,
            modelName: 'mdaCase'
        }
    )
    return mdaCase
}
