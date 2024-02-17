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
    title: DataTypes.STRING,
    chatDetail: DataTypes.STRING,
    chatcount: DataTypes.INTEGER,
    status: DataTypes.INTEGER, // 0=新对话，1=旧对话，2=已归档对话
    startAt: DataTypes.DATE,
    endAt: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'mdaQaRecord',
  });
  return mdaQaRecord;
};