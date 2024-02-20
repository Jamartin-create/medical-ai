'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class mdaQaReview extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  mdaQaReview.init({
    uid: DataTypes.STRING,
    recordid: DataTypes.STRING,
    tags: DataTypes.STRING, // 关键词
    content: DataTypes.STRING, // 对话总结内容
    helpful: DataTypes.INTEGER, // 是否有帮助：0=有；1=没有
    comment: DataTypes.STRING // 评论
  }, {
    sequelize,
    modelName: 'mdaQaReview',
  });
  return mdaQaReview;
};