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
  var dbFolder = (folder) ? path.resolve(folder) : path.resolve('content');

  folder = path.join(dbFolder, '_content');
  destination = path.join(folder, title) + '.md';

  if (!content || !title) {
    log.error('No content or title supplied!');
  }

  return fsStat(folder).then(function checkStats(stats) {
    if (!stats.isDirectory()) {
      log.error('Save folder doesn\'t exist!');
      process.exit();
    }
    return writeFile(destination, content, title, dbFolder);
  }).catch(function mkDir() {
    return fsMkdir(folder).then(function write() {
      return writeFile(destination, content, title, dbFolder);
    });
  });
};

function writeFile(destination, content, title, dbFolder) {
  return fsWriteFile(destination, content).then(function successSaveFile() {
    var relativeDestination = path.relative(path.resolve(dbFolder), destination);
    log.debug(title + ' saved.');
    return {
      path: relativeDestination,
      title: title,
    };
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

  return fsStat(dbPath).then(function loadDbFile() {
    return fsStat(contentDir).then(function loadDb() {
      return getData(dbPath);
    }).catch(function makeContentDir() {
      return fsMkdir(contentDir).then(function loadDb() {
        return getData(dbPath);
      });
    });
  }).catch(function loadWithoutDbFile() {
    return fsStat(parentDir).then(function checkContentDir() {
      return fsStat(contentDir).then(function loadDb() {
        return getData();
      }).catch(function makeContentDir() {
        return fsMkdir(contentDir).then(function loadDb() {
          return getData();
        });
      });
    }).catch(function makeParentDir() {
      return fsMkdir(parentDir).then(function makeContentDir() {
        return fsMkdir(contentDir).then(function loadDb() {
          return getData();
        });
      });
    });
  });

  function getData(dbPath) {
    if (!dbPath) { return '{ "doneList" : [] }'; }
    return fsReadFile(dbPath, 'utf-8').then(function successLoadState(content) {
      log.debug('Local database loaded from ' + dbPath);
      return content;
    }).catch(function catchLoadState(err) {
      log.error(err);
    });
  }

};
