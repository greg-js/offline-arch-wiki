'use strict';

var log = require('./util').log;
var mkDirs = require('./util').mkDirs;
var mkDir = require('./util').mkDir;
var sanitize = require('sanitize-filename');
var languages = require('./util').languages;
var toMD = require('to-markdown');

var _ = require('lodash');
var Promise = require('bluebird');

var fsStat = Promise.promisify(require('fs').stat);
var fsReadFile = Promise.promisify(require('fs').readFile);
var fsWriteFile = Promise.promisify(require('fs').writeFile);

var path = require('path');

exports.saveEverything = saveEverything;
exports.saveLanguageWiki = saveLanguageWiki;
exports.writeFile = writeFile;

/**
 * Saves a language-splitObjectList to disk and returns the list of objects
 * with added paths and removed contents
 * @param {Array} splitObjectList
 * @returns {Array} processedObjectList
 **/
function saveEverything(splitObjectList, folder, doWikitext) {
  var dbFolder = (folder) ? path.resolve(folder) : path.resolve('content');

  var saveDir = path.join(dbFolder, '_content');

  var processedObjects = splitObjectList.map(function makePromise(langObject) {
    return new Promise(function resolvePromise(resolve) {
      return resolve(saveLanguageWiki(langObject, saveDir, doWikitext));
    });
  });

  return Promise.all(processedObjects).then(function returnFinishedObject() {
    return processedObjects;
  });
}

/**
 * Saves the articles in one language object ( { lang: .., articles: .. } ) to disk
 * and returns the object with updated properties
 * @param {Object} languageObject
 * @param {String} saveLocation
 * @returns {Object} processedObject
 **/
function saveLanguageWiki(languageWikiObject, saveLocation, doWikitext) {
  var saveLoc = path.join(saveLocation, languageWikiObject.lang);
  var articlesToSave = languageWikiObject.articles.map(function makePromise(article) {
    return new Promise(function returnPromise(resolve) {
      article.title = sanitize(article.title, { replacement: '-' });

      if (doWikitext) {
        article.wtPath = path.join(saveLoc, article.title) + '.wt';
      } else {
        article.mdPath = path.join(saveLoc, article.title) + '.md';
      }

      return writeFile(article, saveLocation, doWikitext).then(function done(savedArticle) {
        return resolve(savedArticle);
      });
    });
  });

  return Promise.all(articlesToSave).then(function returnFinishedObject(savedArticles) {
    return {
      lang: languageWikiObject.lang,
      lastUpdated: languageWikiObject.lastUpdated,
      articles: savedArticles,
    };
  });
}

/**
 * Saves an article to the file system
 * @param {Object} article
 * @param {String} saveLocation
 * @returns {Object} savedArticle
 */

function writeFile(article, saveLocation, doWikitext) {
  var writePath = (doWikitext) ? article.wtPath : article.mdPath;
  var writeContent = (doWikitext) ? article.content : toMD(article.content);

  return new Promise(function save(resolve, reject) {
    return fsWriteFile(writePath, writeContent).then(function successSaveFile() {
      // make relative destination for saving to db
      if (doWikitext) {
        article.wtPath = path.relative(path.resolve(saveLocation, '..'), article.wtPath);
      } else {
        article.mdPath = path.relative(path.resolve(saveLocation, '..'), article.mdPath);
      }
      delete article.content;
      log.debug(article.title + ' saved.');
      return resolve(article);
    }).catch(function catchSaveFile(err) {
      log.error(err);
      log.error(err.stack);
      return reject(article);
    });
  });
}

exports.storeDb = function storeState(objectList, location) {
  return Promise.all(objectList).then(function saveDb(finishedObjectList) {
    var destination = path.resolve(location, 'db.json');
    var db = {
      'updated': new Date(),
      'db': finishedObjectList,
    };

    return fsWriteFile(destination, JSON.stringify(db)).then(function successStoreState() {
      log.debug('Local store successful');
      return destination;
    }).catch(function catchStoreState(err) {
      log.error(err);
    });
  });
};

exports.updateDb = function updateState(oldDb, changes, location, doWikitext) {
  var destination = path.resolve(location, 'db.json');

  var result = {
    'updated': new Date(),
    'db': [],
  };

  return Promise.all(changes).then(function forEachChange(doneChanges) {
    doneChanges.forEach(function updateLangObject(langObj) {
      var langInDb = _.find(oldDb, { lang: langObj.lang });
      langObj.articles.forEach(function updateArticle(articleObj) {
        var articleInOldDb = _.find(langInDb.articles, { pageid: articleObj.pageid });

        if (!articleInOldDb) {
          langInDb.articles.push(articleObj);
        } else {
          articleInOldDb.length = articleObj.length;
          articleInOldDb.lastrevid = articleObj.lastrevid;
          articleInOldDb.title = articleObj.title;
          articleInOldDb.url = articleObj.url;
          articleInOldDb.lastMod = articleObj.lastMod;
          if (doWikitext) {
            articleInOldDb.wtPath = articleObj.wtPath;
            articleInOldDb.description = articleObj.description;
          } else {
            articleInOldDb.mdPath = articleObj.mdPath;
          }
        }
      });
    });

    result.db = oldDb;

    return fsWriteFile(destination, JSON.stringify(result)).then(function successStoreState() {
      log.debug('Local store successful');
      return destination;
    }).catch(function catchStoreState(err) {
      log.error(err);
    });
  });
};

exports.loadDb = function loadState(dbPath) {
  var parentDir = path.resolve(dbPath, '..');
  var contentDir = path.join(parentDir, '_content');

  var languageDirs = Object.keys(languages).map(function mapDirs(lang) {
    return path.join(contentDir, lang);
  });

  return fsStat(dbPath)
    .then(function loadWithDb() {
      return mkDirs([parentDir, contentDir].concat(languageDirs)).then(function load() {
        return getData(dbPath);
      });
    }).catch(function loadWithoutDb() {
      return mkDirs([parentDir, contentDir].concat(languageDirs)).then(function load() {
        return getData();
      });
    });


  function getData(pathToDb) {
    if (!pathToDb) {
      log.debug('Empty local db loaded');
      return '{ "db" : [] }';
    }
    return fsReadFile(pathToDb, 'utf-8').then(function successLoadState(content) {
      log.debug('Local database loaded from ' + pathToDb);
      return content;
    }).catch(function catchLoadState(err) {
      log.error(err);
    });
  }
};
