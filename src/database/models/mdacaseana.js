'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class mdaCaseAna extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  mdaCaseAna.init({
    uid: DataTypes.STRING,
    helpful: DataTypes.INTEGER,
    type: DataTypes.INTEGER,
    advice: DataTypes.STRING,
    diseases: DataTypes.STRING,
    reasons: DataTypes.STRING,
    helpful: DataTypes.INTEGER,
    genAt: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'mdaCaseAna',
  });
  return mdaCaseAna;
};