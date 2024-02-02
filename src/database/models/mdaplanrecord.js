'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class mdaPlanRecord extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  mdaPlanRecord.init({
    uid: DataTypes.STRING,
    planid: DataTypes.STRING,
    diet: DataTypes.STRING,
    sleep: DataTypes.STRING,
    medical: DataTypes.STRING,
    memo: DataTypes.STRING,
    status: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'mdaPlanRecord',
  });
  return mdaPlanRecord;
};