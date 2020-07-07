'use strict';
module.exports = (sequelize, DataTypes) => {
  const languageType = sequelize.define('languageType', {
    languageTypeCode: DataTypes.STRING,
    languageTypeDesc: DataTypes.STRING
  }, {});
  languageType.associate = function(models) {
    // associations can be defined here
  };
  return languageType;
};