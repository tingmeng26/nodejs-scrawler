'use strict';
module.exports = (sequelize, DataTypes) => {
  const articleStore = sequelize.define('articleStore', {
    memberId: DataTypes.STRING,
    articleId: DataTypes.STRING
  }, {});
  articleStore.associate = function(models) {
    // associations can be defined here
  };
  return articleStore;
};