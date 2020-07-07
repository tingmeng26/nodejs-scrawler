'use strict';
module.exports = (sequelize, DataTypes) => {
  const article = sequelize.define('article', {
    author: DataTypes.STRING,
    articleId: {
      allowNull: false,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4
    },
    datePublished: DataTypes.STRING,
    dek: DataTypes.STRING,
    direction: DataTypes.STRING,
    domain: DataTypes.STRING,
    excerpt: DataTypes.STRING,
    leadImageUrl: DataTypes.STRING,
    nextPageUrl: DataTypes.STRING,
    renderedPages: DataTypes.STRING,
    title: DataTypes.STRING,
    totalPages: DataTypes.STRING,
    url: DataTypes.STRING,
    wordCount: DataTypes.STRING,
    articleTypeCode: DataTypes.STRING,
    languageTypeCode: DataTypes.STRING
  }, {});
  article.associate = function(models) {
    // associations can be defined here
  };
  return article;
};