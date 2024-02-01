'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class mdaPlanOverview extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  mdaPlanOverview.init({
    uid: DataTypes.STRING,
    summary: DataTypes.STRING,
    title: DataTypes.STRING,
    target: DataTypes.STRING,
    cycle: DataTypes.STRING,
    helpful: DataTypes.INTEGER,
    status: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'mdaPlanOverview',
  });
  return mdaPlanOverview;
};