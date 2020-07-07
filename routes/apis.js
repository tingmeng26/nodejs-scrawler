const express = require('express');
const app = express();
const router = express.Router();

const articleController = require('../controllers').articles;
const memberController = require('../controllers').members;
const systemSettingController = require('../controllers').systemSettings;

/**
 * 新增會員訊
 */
router.post("/member", memberController.addMember);

/**
 * 新增文章
 */
router.post("/article", articleController.addArticle);

/**
 * 取得文章內容
 */
router.get("/article/:articleId", articleController.findArticle);

/**
 * 更改文章內容
 */
router.put("/article/:articleId", articleController.updateArticle);

/**
 * 
 */
router.delete("/article/:articleId", articleController.deleteArticle);

/**
 * 取得文章類型
 */
router.get("/system/articleType", systemSettingController.findArticleType);

/**
 * 取得文章語言類型
 */
router.get("/system/languageType", systemSettingController.findLanguageType);

/**
 * 取得系統所有相關設定
 */
router.get("/system", systemSettingController.findAllConfig);

/**
 * 取得使用者的所有文章
 */
router.get("/bookstore", articleController.findArticles);

/**
 * 更新預設文章
 */
router.put("/bookstore/defaultArticle", articleController.updateDefaultArticle);

/**
 * 取得預設文章
 */
router.get("/bookstore/defaultArticle", articleController.findDefaultArticle);

/**
 * 閱讀模式
 */
router.get("/parseReadingMode", articleController.parseReadingMode);

router.get("/syncArticles", articleController.readExcelToArticle);

// app 爬文章
router.post("/getArticle",articleController.getArticleByCrawler);

module.exports = router;
