'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class mdaPlanReview extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  mdaPlanReview.init({
    uid: DataTypes.STRING,
    overviewid: DataTypes.STRING,
    tags: DataTypes.STRING,
    content: DataTypes.STRING,
    comment: DataTypes.STRING,
    helpful: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'mdaPlanReview',
  });
  return mdaPlanReview;
};