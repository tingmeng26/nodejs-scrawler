const path = require('path');
const moment = require('moment-timezone');
const nodeMercuryParser = require('node-mercury-parser')
const fs = require('fs');
const htmlToText = require('html-to-text');

const sysConfig = require('../config/system-config');
const models = require('../models');

const memberModeler = models.member;

function addMember(req, res) {
    memberModeler.create({
        defaultArticleId: sysConfig.default_article_id
    }).then(member => {
        var result = {
            memberId: member.memberId,
            defaultArticleId: member.defaultArticleId
        }
        res.status(200).send(result);
    }).catch(error => {
        res.status(400).send(error);
    });
}

module.exports = {
    addMember
}