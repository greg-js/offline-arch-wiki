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

  var dbFolder = (folder) ? path.resolve(folder) : path.resolve('content');

  folder = path.join(dbFolder, '_content');
  folder = (article.category) ? path.join(folder, 'categories') : folder;

  if (!article.md || !article.title) {
    log.error('No content or title supplied!');
  }

  article.path = path.join(folder, article.title) + '.md';
  article.title = sanitize(article.title, { replacement: '-' });

  return fsStat(folder).then(function checkStats(stats) {
    if (!stats.isDirectory()) {
      log.error('Save folder doesn\'t exist!');
      process.exit();
    }
    return writeFile(article, dbFolder);
  }).catch(function mkDir() {
    return fsMkdir(folder).then(function write() {
      return writeFile(article, dbFolder);
    });
  });
};

function writeFile(article, dbFolder) {
  return fsWriteFile(article.path, article.md).then(function successSaveFile() {
    // make relative destination for saving to db and get rid of md on article object
    article.path = path.relative(path.resolve(dbFolder), article.path);
    delete article.md;
    log.debug(article.title + ' saved.');
    return article;
  }).catch(function catchSaveFile(err) {
    log.error(err);
  });
}

exports.storeDb = function storeState(doneList, folder) {
  var destination = (folder) ? path.resolve(folder, 'db.json') : path.resolve('content', 'db.json');
  var db = {
    'updated': new Date(),
    'doneList': doneList,
  };
  return fsWriteFile(destination, JSON.stringify(db)).then(function successStoreState() {
    log.debug('Local store successful');
    return destination;
  }).catch(function catchStoreState(err) {
    log.error(err);
  });
};

exports.loadDb = function loadState(dbPath) {
  var parentDir = dbPath.substr(0, dbPath.lastIndexOf('/'));
  var contentDir = path.join(parentDir, '_content');
  var catDir = path.join(contentDir, 'categories');

  return fsStat(dbPath).then(function loadDbFile() {
    return fsStat(contentDir).catch(makeContentDir).then(makeCatDir).then(function loadDb() {
      return getData(dbPath);
    });
  }).catch(function loadWithoutDbFile() {
    return fsStat(parentDir).then(function checkContentDir() {
      return fsStat(contentDir).then(function loadDb() {
        return getData();
      }).catch(makeContentDir).then(makeCatDir).then(function loadDb() {
        return getData();
      });
    }).catch(makeParentDir).then(makeContentDir).then(makeCatDir).then(function loadDb() {
      return getData();
    });
  });

  function makeContentDir() {
    return fsMkdir(contentDir).catch(function catchMakeContentDir() {
      log.debug('Content dir already exists, skipping mkdir..');
    });
  }
  function makeParentDir() {
    return fsMkdir(parentDir).catch(function catchMakeParentDir() {
      log.debug('Parent dir already exists, skipping mkdir..');
    });
  }
  function makeCatDir() {
    return fsMkdir(catDir).catch(function catchMakeCatDir() {
      log.debug('Category dir already exists, skipping mkdir..');
    });
  }

  function getData(pathToDb) {
    if (!pathToDb) { return '{ "doneList" : [] }'; }
    return fsReadFile(pathToDb, 'utf-8').then(function successLoadState(content) {
      log.debug('Local database loaded from ' + pathToDb);
      return content;
    }).catch(function catchLoadState(err) {
      log.error(err);
    });
  }

};
