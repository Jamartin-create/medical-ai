'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class mdaQaRecord extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  mdaQaRecord.init({
    uid: DataTypes.STRING,
    userid: DataTypes.STRING,
    title: DataTypes.STRING, // 聊天标题（ai 生成）
    chatDetail: DataTypes.STRING, // 对话详情
    chatcount: DataTypes.INTEGER, // 对话记录数量
    status: DataTypes.INTEGER, // 0=新对话，1=旧对话，2=已归档对话
    startAt: DataTypes.DATE,
    endAt: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'mdaQaRecord',
  });
  return mdaQaRecord;
};