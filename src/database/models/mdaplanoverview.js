'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class mdaPlanOverview extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  mdaPlanOverview.init({
    uid: DataTypes.STRING,
    planid: DataTypes.STRING, 
    content: DataTypes.STRING, // 大纲内容
    title: DataTypes.STRING, // 计划标题
    helpful: DataTypes.INTEGER // 是否有帮助：0=有；1=没有
  }, {
    sequelize,
    modelName: 'mdaPlanOverview',
  });
  return mdaPlanOverview;
};