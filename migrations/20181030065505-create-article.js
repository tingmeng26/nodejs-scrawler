'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('articles', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      author: {
        type: Sequelize.STRING
      },
      articleId: {
        type: Sequelize.STRING
      },
      datePublished: {
        type: Sequelize.STRING
      },
      dek: {
        type: Sequelize.STRING
      },
      direction: {
        type: Sequelize.STRING
      },
      domain: {
        type: Sequelize.STRING
      },
      excerpt: {
        type: Sequelize.STRING
      },
      leadImageUrl: {
        type: Sequelize.STRING
      },
      nextPageUrl: {
        type: Sequelize.STRING
      },
      renderedPages: {
        type: Sequelize.STRING
      },
      title: {
        type: Sequelize.STRING
      },
      totalPages: {
        type: Sequelize.STRING
      },
      url: {
        type: Sequelize.STRING
      },
      wordCount: {
        type: Sequelize.STRING
      },
      articleTypeCode: {
        type: Sequelize.STRING
      },
      languageTypeCode: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('articles');
  }
};