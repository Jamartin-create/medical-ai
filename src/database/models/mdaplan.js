'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class mdaPlan extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  mdaPlan.init({
    uid: DataTypes.STRING,
    userid: DataTypes.STRING,
    type: DataTypes.INTEGER, // 类型：0=病例，1=养生，2=康复
    caseid: DataTypes.STRING, // 案例 id（如果 type 为 0 的话）
    title: DataTypes.STRING, // 标题，AI 生成
    target: DataTypes.STRING, // 计划目标
    cycle: DataTypes.STRING, // 计划周期
    status: DataTypes.INTEGER, // 状态：0=进行中；1=已结束；2=中断
    startAt: DataTypes.DATE, // 开始时间
    endAt: DataTypes.DATE // 结束时间
  }, {
    sequelize,
    modelName: 'mdaPlan',
  });
  return mdaPlan;
};