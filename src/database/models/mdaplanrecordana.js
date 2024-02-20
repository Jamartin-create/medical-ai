'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class mdaPlanRecordAna extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  mdaPlanRecordAna.init({
    uid: DataTypes.STRING,
    recordid: DataTypes.STRING,
    newsid: DataTypes.STRING,
    content: DataTypes.STRING, // 计划总结及明日计划内容
    helpful: DataTypes.INTEGER, // 是否有帮助：0=有；1=没有
    genAt: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'mdaPlanRecordAna',
  });
  return mdaPlanRecordAna;
};