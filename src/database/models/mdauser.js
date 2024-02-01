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
    username: DataTypes.STRING,
    password: DataTypes.STRING,
    avatar: DataTypes.STRING,
    realname: DataTypes.STRING,
    age: DataTypes.INTEGER,
    tel: DataTypes.STRING,
    email: DataTypes.STRING,
    status: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'mdaUser',
  });
  return mdaUser;
};