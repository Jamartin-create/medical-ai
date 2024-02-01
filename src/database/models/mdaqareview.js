'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class mdaQaReview extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  mdaQaReview.init({
    uid: DataTypes.STRING,
    recordid: DataTypes.STRING,
    tags: DataTypes.STRING,
    content: DataTypes.STRING,
    helpful: DataTypes.INTEGER,
    comment: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'mdaQaReview',
  });
  return mdaQaReview;
};