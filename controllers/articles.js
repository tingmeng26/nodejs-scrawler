const path = require('path');
const moment = require('moment-timezone');
const nodeMercuryParser = require('node-mercury-parser')
const mercuryParser = require('@postlight/mercury-parser')
const fs = require('fs');
const htmlToText = require('html-to-text');
const XLSX = require('xlsx');

const sysConfig = require('../config/system-config');
const models = require('../models');

const articleModeler = models.article;
const memberModeler = models.member;
const memberArticleModeler = models.articleStore;
const articleTypeModeler = models.articleType;
const languageTypeModeler = models.languageType;

function removeContentHyperlink(content) {
  let startPointer = content.indexOf("[http", 0);
  let finalContent = content.substring(0, startPointer);
  if (startPointer > -1) {
    while (startPointer > -1) {
      let endPointer = content.indexOf("]", startPointer);
      startPointer = content.indexOf("[http", endPointer + 1);
      if (startPointer > -1) {
        finalContent += content.substring(endPointer + 1, startPointer);
      } else {
        finalContent += content.substring(endPointer + 1, content.length);
      }
    }
  } else {
    finalContent = content;
  }
  return finalContent;
}

function addArticle(req, res) {
  // 創建存放文章的目錄
  let stat = null;
  try {
    stat = fs.statSync(sysConfig.bookcase);
  } catch (err) {
    fs.mkdirSync(sysConfig.bookcase);
  }
  if (stat && !stat.isDirectory()) {
    throw new Error('Directory cannot be created because an inode of a different type ' +
      'exists at "' + dest + '"');
  } else {
    let memberId = req.headers.member_id;
    if ((null == memberId || undefined == memberId) && false) {
      // 無使用者資訊
      res.status(401).send('member_id not found!');
    } else {
      let url = req.body.url;
      let userArticle = req.body.article;
      if (undefined != url && undefined != userArticle) {
        // 無使用者資訊
        res.status(400).send("article 及 url 參數請擇一使用");
      } else if (undefined == url && undefined == userArticle) {
        res.status(400).send("未提供新增內容資訊");
      } else {
        memberModeler.findOne({
          where: {
            memberId: memberId
          }
        }).then(member => {
          member = 1;
          if (null != member) { // 確認有這使用者
            if (url != undefined) {
              mercuryParser.parse(url)
                .then(result => {
                  // 轉換 html 成 text
                  let text = htmlToText.fromString(result.content, {
                    wordwrap: 130
                  });
                  text = removeContentHyperlink(text);
                  result.content = text;
                  console.log(result)

                  articleModeler.create({

                  }).then(article => {
                    console.log(article);
                    let articleTypeCode = req.body.articleTypeCode;
                    let languageTypeCode = req.body.languageTypeCode;
                    if (null == articleTypeCode || undefined == articleTypeCode) {
                      articleTypeCode = 'M';
                    }
                    if (null == languageTypeCode || undefined == languageTypeCode) {
                      languageTypeCode = 'zh-TW';
                    }
                    articleModeler.update({
                      author: result.author,
                      datePublished: result.date_published,
                      dek: result.dek,
                      direction: result.direction,
                      domain: result.domain,
                      excerpt: result.excerpt,
                      leadImageUrl: result.lead_image_url,
                      nextPageUrl: result.next_image_url,
                      renderedPages: result.rendered_pages,
                      title: result.title,
                      totalPages: result.total_pages,
                      url: result.url,
                      wordCount: text.length,
                      articleTypeCode: articleTypeCode,
                      languageTypeCode: languageTypeCode
                    }, {
                      where: {
                        articleId: article.articleId
                      },
                    }).then(articleFinish => {
                      // 建立關聯
                      memberArticleModeler.create({
                        memberId: member.memberId,
                        articleId: article.articleId
                      }).then(memberArticle => {
                        let returnResult = {
                          message: "新增文章成功"
                        }
                        res.status(200).send(returnResult);
                      }).catch(error => {
                        res.status(400).send(error);
                      });

                      // 寫入檔案
                      fs.writeFile(sysConfig.bookcase + article.articleId, text, function (err) {
                        if (err)
                          console.log(err);
                        else
                          console.log('Write operation complete.');
                      });
                    }).catch(error => {
                      res.status(400).send(error);
                    });
                  }).catch(error => {
                    res.status(400).send(error);
                  });
                }).catch(error => {
                  res.status(400).send(error);
                });
            } else if (userArticle != undefined) {
              // 手動新增文章內容
              articleModeler.create({

              }).then(article => {
                let articleTypeCode = req.body.articleTypeCode;
                let languageTypeCode = req.body.languageTypeCode;
                let leadImageUrl = req.body.leadImageUrl;
                let url = req.body.url;
                let author = req.body.author;
                if (null == articleTypeCode || undefined == articleTypeCode) {
                  articleTypeCode = 'M';
                }
                if (null == languageTypeCode || undefined == languageTypeCode) {
                  languageTypeCode = 'zh-TW';
                }

                articleModeler.update({
                  title: userArticle.title,
                  wordCount: userArticle.content.length,
                  articleTypeCode: articleTypeCode,
                  languageTypeCode: languageTypeCode,
                  leadImageUrl: leadImageUrl,
                  url: url,
                  author: author
                }, {
                  where: {
                    articleId: article.articleId
                  },
                }).then(articleFinish => {
                  // 建立關聯
                  memberArticleModeler.create({
                    memberId: member.memberId,
                    articleId: article.articleId
                  }).then(memberArticle => {
                    let returnResult = {
                      message: "新增文章成功"
                    }
                    res.status(200).send(returnResult);
                  }).catch(error => {
                    res.status(400).send(error);
                  });

                  // 寫入檔案
                  fs.writeFile(sysConfig.bookcase + article.articleId, userArticle.content, function (err) {
                    if (err)
                      console.log(err);
                    else
                      console.log('Write operation complete.');
                  });
                }).catch(error => {
                  res.status(400).send(error);
                });
              }).catch(error => {
                res.status(400).send(error);
              });
            }
          } else {
            let error = {
              message: "此使用者無權限使用"
            }
            // 無使用者資訊
            res.status(403).send(error);
          }
        }).catch(error => {
          res.status(400).send(error);
        });
      }
    }
  }
}

function findArticles(req, res) {
  let memberId = req.headers.member_id;

  let querylimit = 1 * req.query.limit;
  let offset = (req.query.page - 1) * querylimit;

  let articleTypeCode = req.query.articleTypeCode;

  let minWordCount = (undefined != req.query.minWordCount) ? parseInt(req.query.minWordCount) : 0;
  let maxWordCount = (undefined != req.query.maxWordCount) ? parseInt(req.query.maxWordCount) : sysConfig.max_word_count;

  if ((null == memberId || undefined == memberId) && false) {
    // 無使用者資訊
    let error = {
      message: "member_id not found!"
    }
    res.status(401).send(error);
  } else {
    memberModeler.findOne({
      where: {
        memberId: memberId
      }
    }).then(member => {
      if (null != member) {
        let sql = "SELECT id, articleId, title, wordCount, articleTypeCode, languageTypeCode " +
          "FROM (";

        let sysSql = "( " +
          "SELECT id, articleId, title, wordCount, articleTypeCode, languageTypeCode " +
          "    FROM articles " +
          "    WHERE articleTypeCode = 'S')";

        let manuSql = "( " +
          "SELECT id, articleId, title, wordCount, articleTypeCode, languageTypeCode " +
          "	FROM articles " +
          "	WHERE articleId IN ( " +
          "		SELECT articleId " +
          "		FROM articleStores " +
          "		WHERE memberId = :member_id) " +
          "		AND articleTypeCode = 'M')";
        if (undefined != articleTypeCode) {
          if (articleTypeCode === 'S') {
            sql += sysSql;
          } else if (articleTypeCode === 'M') {
            sql += manuSql;
          }
        } else {
          sql += sysSql + " UNION " + manuSql;
        }
        sql += ") a ";
        sql += "WHERE wordCount > :minWordCount AND wordCount <= :maxWordCount ";

        if (undefined != req.query.limit && undefined != req.query.page) {
          // 分頁搜尋
          models.sequelize.query(sql + "order by articleTypeCode NOT IN('S'), id desc LIMIT :limit_offset, :session_limit", {
            replacements: {
              member_id: memberId,
              limit_offset: offset,
              session_limit: querylimit,
              minWordCount: minWordCount,
              maxWordCount: maxWordCount
            },
            type: models.sequelize.QueryTypes.SELECT
          })
            .then(articles => {
              let result = new Array();
              articles.forEach(function (item, index) {
                let obj = {
                  articleId: item.articleId,
                  title: item.title,
                  wordCount: item.wordCount,
                  articleTypeCode: item.articleTypeCode,
                  languageTypeCode: item.languageTypeCode
                }
                result.push(obj);
              });
              res.status(200).send(result);
            })
            .catch(error => {
              res.status(400).send(error);
            });
        } else {
          // 全部搜尋
          models.sequelize.query(sql, {
            replacements: {
              member_id: memberId,
              minWordCount: minWordCount,
              maxWordCount: maxWordCount
            },
            type: models.sequelize.QueryTypes.SELECT
          })
            .then(articles => {
              res.status(200).send(articles);
            })
            .catch(error => {
              res.status(400).send(error);
            });
        }
      } else {
        let error = {
          message: "此使用者無權限使用"
        }
        // 無使用者資訊
        res.status(403).send(error);
      }
    }).catch(error => {
      res.status(400).send(error);
    });
  }
}

function parseReadingMode(req, res) {
  let url = req.query.url;
  if (undefined != url) {
    mercuryParser.parse(url)
      .then(result => {
        if (undefined == result.response) {  // 如果 result 沒有 response 則表示有正常 parse
          // 轉換 html 成 text
          let text = htmlToText.fromString(result.content, {
            wordwrap: 130
          });
          text = removeContentHyperlink(text);

          let returnResult = {
            title: result.title,
            content: text,
            wordCount: text.length,
            leadImageUrl: result.lead_image_url,
            url: result.url,
            author: result.author
          }
          res.status(200).send(returnResult);
        } else {
          let error = {
            message: result.message
          }
          res.status(502).send(error);
        }
      })
      .catch(error => {
        res.status(400).send(error);
      });
  }
}

function updateArticle(req, res) {
  let memberId = req.headers.member_id;
  let articleId = req.params.articleId;
  if (null == memberId || undefined == memberId) {
    // 無使用者資訊
    let error = {
      message: "member_id not found!"
    }
    res.status(401).send(error);
  } else {
    if (null == articleId || undefined == articleId) {
      // 無articleId
      let error = {
        message: "articleId not found!"
      }
      res.status(400).send(error);
    } else {
      memberModeler.findOne({
        where: {
          memberId: memberId
        }
      }).then(member => {
        if (null != member) {
          let updateObject = new Object();
          let updateTitle = req.body.title;
          let updateContent = req.body.content;
          if (undefined != updateTitle || null != updateTitle) {
            updateObject.title = updateTitle;
          }
          if (undefined != updateContent || null != updateContent) {
            updateObject.wordCount = updateContent.length;
          }

          if ((null == updateTitle || undefined == updateTitle) &&
            (undefined == updateContent || null == updateContent)) {
            let error = {
              message: "無修改內容"
            }
            res.status(400).send(error);
          } else {
            articleModeler.update(updateObject, {
              where: {
                articleId: articleId
              }
            }).then(affectedCount => {
              if (affectedCount[0] > 0) {
                // 寫入檔案
                if (undefined != updateContent || null != updateContent) {
                  fs.writeFile(sysConfig.bookcase + articleId, updateContent, function (err) {
                    if (err) {
                      console.log(err);
                    } else {
                      console.log('Write operation complete.');
                      let result = {
                        message: "文章更新成功"
                      }
                      res.status(200).send(result);
                    }
                  });
                } else {
                  let result = {
                    message: "文章更新成功"
                  }
                  res.status(200).send(result);
                }
              } else {
                let error = {
                  message: "文章更新失敗"
                }
                res.status(200).send(error);
              }
            }).catch(error => {
              let errorObject = {
                message: error.message
              }
              res.status(400).send(errorObject);
            });
          }
        } else {
          let error = {
            message: "此使用者無權限使用"
          }
          // 無使用者資訊
          res.status(403).send(error);
        }
      }).catch(error => {
        let errorObject = {
          message: error.message
        }
        res.status(400).send(errorObject);
      });
    }
  }
}

function findArticle(req, res) {
  let memberId = req.headers.member_id;
  let articleId = req.params.articleId;
  if (null == memberId || undefined == memberId) {
    // 無使用者資訊
    let error = {
      message: "member_id not found!"
    }
    res.status(401).send(error);
  } else {
    if (null == articleId || undefined == articleId) {
      // 無articleId
      let error = {
        message: "articleId not found!"
      }
      res.status(400).send(error);
    } else {
      memberModeler.findOne({
        where: {
          memberId: memberId
        }
      }).then(member => {
        if (null != member) {
          articleModeler.findOne({
            where: {
              articleId: articleId
            }
          }).then(article => {
            fs.readFile(sysConfig.bookcase + article.articleId, function (err, data) {
              if (err) {
                res.status(400).send(err);
                throw err;
              }
              let result = {
                title: article.title,
                content: data.toString(),
                wordCount: article.wordCount,
                articleTypeCode: article.articleTypeCode,
                languageTypeCode: article.languageTypeCode
              }
              res.status(200).send(result);
            });
          }).catch(error => {
            res.status(400).send(error);
          });
        } else {
          let error = {
            message: "此使用者無權限使用"
          }
          // 無使用者資訊
          res.status(403).send(error);
        }
      }).catch(error => {
        res.status(400).send(error);
      });
    }
  }
}

function updateDefaultArticle(req, res) {
  let memberId = req.headers.member_id;
  let articleId = req.body.articleId;

  if (undefined != memberId && undefined != articleId) {
    memberModeler.findOne({
      where: {
        memberId: memberId
      }
    }).then(member => {
      if (null != member) {
        articleModeler.findOne({
          where: {
            articleId: articleId
          }
        }).then(articleResult => {
          if (null != articleResult) {
            memberModeler
              .update({
                defaultArticleId: articleId
              }, {
                where: {
                  memberId: memberId
                },
              }).then(memberCount => {
                fs.readFile(sysConfig.bookcase + articleId, function (err, data) {
                  if (err) {
                    res.status(400).send(err);
                    throw err;
                  }
                  let result = {
                    message: "已將『" + articleResult.title + "』設為預設文章",
                    article: {
                      articleId: articleResult.articleId,
                      title: articleResult.title,
                      content: data.toString(),
                      wordCount: articleResult.wordCount,
                      articleTypeCode: articleResult.articleTypeCode,
                      languageTypeCode: articleResult.languageTypeCode
                    }
                  }
                  res.status(200).send(result);
                });
              }).catch(error => {
                res.status(400).send(error);
              });
          } else {
            let error = {
              message: "查無此文章"
            }
            res.status(400).send(error);
          }
        }).catch(error => {
          res.status(400).send(error);
        });
      } else {
        let error = {
          message: "此使用者無權限使用"
        }
        // 無使用者資訊
        res.status(403).send(error);
      }
    }).catch(error => {
      res.status(400).send(error);
    });
  } else {
    let error = {
      message: "資訊不足"
    }
    res.status(400).send(error);
  }
}

function findDefaultArticle(req, res) {
  let memberId = req.headers.member_id;
  if (undefined != memberId) {
    memberModeler.findOne({
      where: {
        memberId: memberId
      }
    }).then(member => {
      if (null != member) {
        articleModeler.findOne({
          where: {
            articleId: member.defaultArticleId
          }
        }).then(article => {
          fs.readFile(sysConfig.bookcase + article.articleId, function (err, data) {
            if (err) {
              res.status(400).send(err);
              throw err;
            }
            let result = {
              articleId: article.articleId,
              title: article.title,
              content: data.toString(),
              wordCount: article.wordCount,
              articleTypeCode: article.articleTypeCode,
              languageTypeCode: article.languageTypeCode
            }
            res.status(200).send(result);
          });
        }).catch(error => {
          res.status(400).send(error);
        });
      } else {
        let error = {
          message: "此使用者無權限使用"
        }
        // 無使用者資訊
        res.status(403).send(error);
      }
    }).catch(error => {
      res.status(400).send(error);
    });
  } else {
    // 無使用者資訊
    let error = {
      message: "member_id not found!"
    }
    res.status(401).send(error);
  }
}

function deleteArticle(req, res) {
  let memberId = req.headers.member_id;
  let articleId = req.params.articleId;
  if (undefined != memberId) {
    return memberModeler.findOne({
      where: {
        memberId: memberId
      }
    }).then(member => {
      if (null != member) {
        return models.sequelize.transaction(function (t) {
          // chain all your queries here. make sure you return them.
          return articleModeler.destroy({
            where: {
              // criteria
              articleTypeCode: 'M',
              articleId: articleId
            }
          }, { transaction: t }).then(function (result) {
            // console.log(result);
            if (result > 0) {
              return memberArticleModeler.destroy({
                where: {
                  // criteria
                  articleId: articleId,
                  memberId: memberId
                }
              }, { transaction: t }).then(function (result) {
                // console.log(result);
                if (result > 0) {
                  if (member.defaultArticleId === articleId) {
                    return memberModeler.update({
                      defaultArticleId: sysConfig.default_article_id
                    }, {
                      where: {
                        memberId: memberId
                      }
                    }).then(affectedCount => {
                      return affectedCount;
                    }).catch(function (err) {
                      let result = {
                        message: "發生錯誤"
                      }
                      // 無使用者資訊
                      res.status(400).send(result);
                    });
                  } else {
                    return result;
                  }
                } else {
                  return result;
                }
              })
            }
          });
        }).then(function (result) {
          // Transaction has been committed
          // result is whatever the result of the promise chain returned to the transaction callback
          if (result != undefined) {
            // 刪除檔案
            fs.unlink(sysConfig.bookcase + articleId, function (err, data) {
              if (err) {
                res.status(400).send(err);
                throw err;
              }
              let success = {
                message: "文章已刪除"
              }
              res.status(200).send(success);
            });
          } else {
            let success = {
              message: "文章已刪除"
            }
            res.status(200).send(success);
          }
        }).catch(function (err) {
          // Transaction has been rolled back
          // err is whatever rejected the promise chain returned to the transaction callback
          // console.log(err);
          let result = {
            message: "發生錯誤"
          }
          // 無使用者資訊
          res.status(400).send(result);
        });
      } else {
        let error = {
          message: "此使用者無權限使用"
        }
        // 無使用者資訊
        res.status(403).send(error);
      }
    }).catch(error => {
      res.status(400).send(error);
    });
  }
}

function readExcelToArticle(req, res) {
  var workbook = XLSX.readFile('./articles.xlsx');
  var sheet_name_list = workbook.SheetNames;
  sheet_name_list.forEach(function (y) {
    var worksheet = workbook.Sheets[y];

    var titleArr = [];
    var contentArr = [];
    var contentCountArr = [];
    var articleIdArr = [];
    for (z in worksheet) {
      // all keys that do not begin with "!" correspond to cell addresses
      if (z[0] === '!') {
        continue;
      } else {
        // console.log(y + "!" + z + "=" + JSON.stringify(worksheet[z].v));
        if ((z.indexOf("A") != -1 || z.indexOf("B") != -1 || z.indexOf("C") != -1) && z != "A1" && z != "B1" && z != "C1") {
          if (z.indexOf("A") != -1) {
            titleArr.push(worksheet[z].v);
          } else if (z.indexOf("B") != -1) {
            contentArr.push(worksheet[z].v);
          } else if (z.indexOf("C") != -1) {
            contentCountArr.push(worksheet[z].v);

            articleModeler.create({
              articleTypeCode: 'S',
              languageTypeCode: 'zh-TW',
            }).then(article => {
              articleIdArr.push(article.articleId);

              if (articleIdArr.length === contentArr.length) {
                for (j = 0; j < contentArr.length; j++) {
                  fs.writeFile(sysConfig.bookcase + articleIdArr[j], contentArr[j], function (err) {
                    if (err)
                      console.log(err);
                    else
                      console.log('Write operation complete.');
                  });
                }
                let k = 0;
                for (i = 0; i < titleArr.length; i++) {
                  articleModeler.update({
                    title: titleArr[i],
                    wordCount: contentCountArr[i],
                  }, {
                    where: {
                      articleId: articleIdArr[i]
                    },
                  }).then(articleFinish => {
                    k++;
                    if (k === titleArr.length) {
                      let returnResult = {
                        message: "新增文章成功"
                      }
                      // 系統文章無需建立關聯
                      res.status(200).send(returnResult);
                    }
                  }).catch(error => {
                    res.status(400).send(error);
                  });
                }
              }
            }).catch(error => {
              res.status(400).send(error);
            });
          }
        }
      }
    }
  });
}

function getArticleByCrawler(req, res) {
  let url = req.body.url;
  mercuryParser.parse(url)
    .then(result => {
      // 轉換 html 成 text
      let text = htmlToText.fromString(result.content);
      text = removeContentHyperlink(text);
      

      let data = {
        text: text,
        words: text.length,
        title:result.title
      }
      res.status(200).send(data);

      // articleModeler.create({

      // }).then(article => {
      //   console.log(article);
      //   let articleTypeCode = req.body.articleTypeCode;
      //   let languageTypeCode = req.body.languageTypeCode;
      //   if (null == articleTypeCode || undefined == articleTypeCode) {
      //     articleTypeCode = 'M';
      //   }
      //   if (null == languageTypeCode || undefined == languageTypeCode) {
      //     languageTypeCode = 'zh-TW';
      //   }
      //   articleModeler.update({
      //     author: result.author,
      //     datePublished: result.date_published,
      //     dek: result.dek,
      //     direction: result.direction,
      //     domain: result.domain,
      //     excerpt: result.excerpt,
      //     leadImageUrl: result.lead_image_url,
      //     nextPageUrl: result.next_image_url,
      //     renderedPages: result.rendered_pages,
      //     title: result.title,
      //     totalPages: result.total_pages,
      //     url: result.url,
      //     wordCount: text.length,
      //     articleTypeCode: articleTypeCode,
      //     languageTypeCode: languageTypeCode
      //   }, {
      //     where: {
      //       articleId: article.articleId
      //     },
      //   }).then(articleFinish => {
      //     // 建立關聯
      //     memberArticleModeler.create({
      //       memberId: member.memberId,
      //       articleId: article.articleId
      //     }).then(memberArticle => {
      //       let returnResult = {
      //         message: "新增文章成功"
      //       }
      //       res.status(200).send(returnResult);
      //     }).catch(error => {
      //       res.status(400).send(error);
      //     });

      //     // 寫入檔案
      //     fs.writeFile(sysConfig.bookcase + article.articleId, text, function (err) {
      //       if (err)
      //         console.log(err);
      //       else
      //         console.log('Write operation complete.');
      //     });
      //   }).catch(error => {
      //     res.status(400).send(error);
      //   });
      // }).catch(error => {
      //   res.status(400).send(error);
      // });
    }).catch(error => {
      res.status(400).send(error);
    });
}

deleteFolderRecursive = function (path) {
  var files = [];
  if (fs.existsSync(path)) {
    files = fs.readdirSync(path);
    files.forEach(function (file, index) {
      var curPath = path + "/" + file;
      if (fs.statSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursive(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
};

module.exports = {
  addArticle,
  updateDefaultArticle,
  findArticles,
  updateArticle,
  findArticle,
  findDefaultArticle,
  parseReadingMode,
  deleteArticle,
  readExcelToArticle,
  getArticleByCrawler
}
