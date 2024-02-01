'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class mdaCase extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  mdaCase.init({
    uid: DataTypes.STRING,
    curSituation: DataTypes.INTEGER,
    summary: DataTypes.STRING,
    userid: DataTypes.STRING,
    medical: DataTypes.STRING,
    mdHistory: DataTypes.STRING,
    status: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'mdaCase',
  });
  return mdaCase;
};