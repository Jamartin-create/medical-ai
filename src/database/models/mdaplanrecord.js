'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
    class mdaPlanRecord extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }
    mdaPlanRecord.init(
        {
            uid: DataTypes.STRING,
            planid: DataTypes.STRING,
            diet: DataTypes.STRING, // 饮食情况
            sleep: DataTypes.STRING, // 作息情况
            medical: DataTypes.STRING, // 用药情况
            other: DataTypes.STRING, // 其他（例如运动……）
            memo: DataTypes.STRING // 备注
        },
        {
            sequelize,
            modelName: 'mdaPlanRecord'
        }
    )
    return mdaPlanRecord
}
