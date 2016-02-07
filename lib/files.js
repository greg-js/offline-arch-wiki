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

var fs = require('fs');

/**
 * Saves an article to the file system
 * @param {Object} article
 * @param {String} article.title - the title of the article
 * @param {Number} article.pageid - the article's pageid
 * @param {length} article.length - the article's character count
 * @param {Number} article.lastrevid - number signifying last update
 * @param {String} article.md - the markdown for the article
 * @param {String} article.description - a description for the article
 * @param {String} article.categories - categories separated by |
 * @param {String} folder - (optional) folder, default is 'content/_content';
 * @returns {String} title - the title of the article
 */
exports.save = function saveArticle(article, folder) {

  var dbFolder = (folder) ? path.resolve(folder) : path.resolve('content');

  folder = path.join(dbFolder, '_content');

  article.title = sanitize(article.title, { replacement: '-' });
  article.path = path.join(folder, article.title) + '.md';

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
    // make relative destination for saving to db and get rid of md on article object because that's been saved to disk
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
  var parentDir = path.resolve(dbPath, '..');
  var contentDir = path.join(parentDir, '_content');
  var catDir = path.join(contentDir, 'categories');

  return fsStat(dbPath)
    .then(function loadWithDb() {
      return mkDirs([parentDir, contentDir, catDir]).then(function load() {
        return getData(dbPath);
      });
    }).catch(function loadWithoutDb() {
      return mkDirs([parentDir, contentDir, catDir]).then(function load() {
        return getData();
      });
    });

  function mkDir(dir) {
    return new Promise(function makePromise(resolve, reject) {
      return fsMkdir(dir).then(function successMkdir() {
        resolve(dir);
      }).catch(function failMkdir(e) {
        if (e.code === 'EEXIST') {
          resolve(dir);
        }
      });
    });
  }

  function mkDirs(arr) {
    return Promise.each(arr, function makeDirectory(dir) {
      return mkDir(dir);
    });
  }

  function getData(pathToDb) {
    if (!pathToDb) {
      log.debug('Empty local db loaded');
      return '{ "doneList" : [] }';
    }
    return fsReadFile(pathToDb, 'utf-8').then(function successLoadState(content) {
      log.debug('Local database loaded from ' + pathToDb);
      return content;
    }).catch(function catchLoadState(err) {
      log.error(err);
    });
  }

};
