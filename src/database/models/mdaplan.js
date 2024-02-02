'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class mdaPlan extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  mdaPlan.init({
    uid: DataTypes.STRING,
    userid: DataTypes.STRING,
    type: DataTypes.INTEGER,
    caseid: DataTypes.STRING,
    target: DataTypes.STRING,
    cycle: DataTypes.STRING,
    startAt: DataTypes.DATE,
    endAt: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'mdaPlan',
  });
  return mdaPlan;
};