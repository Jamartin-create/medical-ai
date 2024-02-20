'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class mdaPlanReview extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  mdaPlanReview.init({
    uid: DataTypes.STRING,
    planid: DataTypes.STRING,
    tags: DataTypes.STRING, // 关键词
    content: DataTypes.STRING, // 计划复盘
    comment: DataTypes.STRING, // 评论（用户）
    helpful: DataTypes.INTEGER // 是否有帮助：0=有；1=没有
  }, {
    sequelize,
    modelName: 'mdaPlanReview',
  });
  return mdaPlanReview;
};