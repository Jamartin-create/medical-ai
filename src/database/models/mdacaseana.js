'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class mdaCaseAna extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  mdaCaseAna.init({
    uid: DataTypes.STRING,
    caseid: DataTypes.STRING, // 病例 id
    helpful: DataTypes.INTEGER, // 是否有帮助：0=有；1=没有
    type: DataTypes.INTEGER, // 病情类型：0=症状描述（分析病情+给建议）；1=病情描述（给建议
    advice: DataTypes.STRING, // 康复建议
    diseases: DataTypes.STRING, // 病情分析
    reasons: DataTypes.STRING, // 病因分析
    status: DataTypes.INTEGER, // 报告状态：0=正常；1=作废；2=失败
    genAt: DataTypes.DATE // 报告生成日期
  }, {
    sequelize,
    modelName: 'mdaCaseAna',
  });
  return mdaCaseAna;
};