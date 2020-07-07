'use strict';
module.exports = (sequelize, DataTypes) => {
  const articleType = sequelize.define('articleType', {
    articleTypeCode: DataTypes.STRING,
    articleTypeDesc: DataTypes.STRING
  }, {});
  articleType.associate = function(models) {
    // associations can be defined here
  };
  return articleType;
};