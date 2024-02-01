'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class mdaNews extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  mdaNews.init({
    uid: DataTypes.STRING,
    content: DataTypes.STRING,
    tags: DataTypes.STRING,
    source: DataTypes.STRING,
    genAt: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'mdaNews',
  });
  return mdaNews;
};