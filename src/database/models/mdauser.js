'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class mdaUser extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  mdaUser.init({
    uid: DataTypes.STRING,
    username: DataTypes.STRING, // 用户名
    password: DataTypes.STRING, // 密码
    avatar: DataTypes.STRING, // 头像
    realname: DataTypes.STRING, // 真名
    age: DataTypes.INTEGER, // 年龄
    gender: DataTypes.INTEGER, // 性别
    tel: DataTypes.STRING, // 电话
    email: DataTypes.STRING, // 邮箱
    medicalHis: DataTypes.TEXT, // 既往病史
    allergy: DataTypes.TEXT, // 过敏史
    height: DataTypes.INTEGER, // 身高
    weight: DataTypes.INTEGER, // 体重
    status: DataTypes.INTEGER // 状态：0=正常；1=不正常
  }, {
    sequelize,
    modelName: 'mdaUser',
  });
  return mdaUser;
};