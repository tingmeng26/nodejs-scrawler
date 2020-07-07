const models = require('../models');

const articleTypeModeler = models.articleType;
const languageTypeModeler = models.languageType;

function findArticleType(req, res) {
  articleTypeModeler.findAll({

  }).then(articleType => {
    var result = new Array();
    articleType.forEach(function (element) {
      var temp = {
        articleTypeCode: element.articleTypeCode,
        articleTypeDesc: element.articleTypeDesc,
      };
      result.push(temp);
    });
    res.status(200).send(result);
  }).catch(error => {
    res.status(400).send(error);
  });
}

function findLanguageType(req, res) {
  languageTypeModeler.findAll({

  }).then(languageType => {
    var result = new Array();
    languageType.forEach(function (element) {
      var temp = {
        languageTypeCode: element.languageTypeCode,
        languageTypeDesc: element.languageTypeDesc,
      };
      result.push(temp);
    });
    res.status(200).send(result);
  }).catch(error => {
    res.status(400).send(error);
  });
}

function findAllConfig(req, res) {
  articleTypeModeler.findAll({

  }).then(articleType => {
    var articleArray = new Array();
    articleType.forEach(function (element) {
      var temp = {
        articleTypeCode: element.articleTypeCode,
        articleTypeDesc: element.articleTypeDesc,
      };
      articleArray.push(temp);
    });


    languageTypeModeler.findAll({

    }).then(languageType => {
      var languageArray = new Array();
      languageType.forEach(function (element) {
        var temp = {
          languageTypeCode: element.languageTypeCode,
          languageTypeDesc: element.languageTypeDesc,
        };
        languageArray.push(temp);
      });

      var result = {
        articleTypes: articleArray,
        languageTypes: languageArray
      }
      res.status(200).send(result);
    }).catch(error => {
      res.status(400).send(error);
    });
  }).catch(error => {
    res.status(400).send(error);
  });
}

module.exports = {
  findLanguageType,
  findArticleType,
  findAllConfig
}