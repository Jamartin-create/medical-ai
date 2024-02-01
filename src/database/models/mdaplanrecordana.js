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
    overviewid: DataTypes.STRING,
    newsid: DataTypes.STRING,
    summary: DataTypes.STRING,
    helpful: DataTypes.INTEGER,
    genAt: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'mdaPlanRecordAna',
  });
  return mdaPlanRecordAna;
};