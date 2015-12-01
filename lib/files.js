'use strict';

var log = require('./util').log;
var sanitize = require('sanitize-filename');

var Promise = require('bluebird');

var fsStat = Promise.promisify(require('fs').stat);
var fsReadFile = Promise.promisify(require('fs').readFile);
var fsWriteFile = Promise.promisify(require('fs').writeFile);
var fsMkdir = Promise.promisify(require('fs').mkdir);

var request = require('request-promise');
var cheerio = require('cheerio');

var path = require('path');

/**
 * Saves an article to the file system
 * @param {Object} article
 * @param {String} article.title - the title of the article
 * @param {String} article.md - the markdown for the article
 * @param {String} article.parentCat - the markdown for the article
 * @param {String} folder - (optional) folder, default is 'content/_content';
 * @returns {String} title - the title of the article
 */
exports.save = function saveArticle(article, folder) {

  var content = article.md;
  var title = sanitize(article.title);

  var destination;

  folder = (folder) ? path.resolve(folder, '_content') : path.resolve('content/_content');
  destination = path.join(folder, title) + '.md';

  if (!content || !title) {
    log.error('No content or title supplied!');
  }

  fsStat(folder).then(function checkStats(stats) {
    if (!stats.isDirectory()) {
      log.error('Save folder doesn\'t exist!');
      process.exit();
    }
  });

  return fsWriteFile(destination, content).then(function successSaveFile() {
    log.debug(title + ' saved.');
    return {
      path: destination,
      title: title,
      category: article.parentCat,
    };
  }).catch(function catchSaveFile(err) {
    log.error(err);
  });
};

exports.storeDb = function storeState(doneList, folder) {
  var destination = (folder) ? path.resolve(folder, 'db.json') : path.resolve('content', 'db.json');
  var db = { 'doneList': doneList };
  return fsWriteFile(destination, JSON.stringify(db)).then(function successStoreState() {
    log.debug('Local store successful');
    return destination;
  }).catch(function catchStoreState(err) {
    log.error(err);
  });
};

exports.loadDb = function loadState(statePath) {
  var parentDir = statePath.substr(0, statePath.lastIndexOf('/'));
  return fsStat(parentDir).then(function checkStats(stats) {
    return fsReadFile(statePath, 'utf-8').then(function successLoadState(content) {
      log.debug('Local database loaded from ' + statePath);
      return content;
    }).catch(function catchLoadState(err) {
      log.error(err);
    });
  }).catch(function failCheckStats() {
    return fsMkdir(parentDir).then(function makePD() {
      log.debug(parentDir + ' created.');
      return '{ "doneList" : [] }';
    });
  });
};
