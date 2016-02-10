'use strict';

var log = require('./util').log;
var mkDirs = require('./util').mkDirs;
var mkDir = require('./util').mkDir;
var sanitize = require('sanitize-filename');
var languages = require('./util').languages;

var Promise = require('bluebird');

var fsStat = Promise.promisify(require('fs').stat);
var fsReadFile = Promise.promisify(require('fs').readFile);
var fsWriteFile = Promise.promisify(require('fs').writeFile);

var request = require('request-promise');
var cheerio = require('cheerio');

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
function saveEverything(splitObjectList, folder) {
  var dbFolder = (folder) ? path.resolve(folder) : path.resolve('content');

  var saveDir = path.join(dbFolder, '_content');

  var processedObjects = splitObjectList.map(function makePromise(langObject) {
    return new Promise(function resolvePromise(resolve) {
      return resolve(saveLanguageWiki(langObject, saveDir));
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
function saveLanguageWiki(languageWikiObject, saveLocation) {
  var saveLoc = path.join(saveLocation, languageWikiObject.lang);
  var articlesToSave = languageWikiObject.articles.map(function makePromise(article) {
    return new Promise(function returnPromise(resolve) {
      article.title = sanitize(article.title, { replacement: '-' });
      article.mdPath = path.join(saveLoc, article.title) + '.md';
      article.wtPath = path.join(saveLoc, article.title) + '.wt';
      return writeFile(article, saveLocation).then(function done(savedArticle) {
        return resolve(savedArticle);
      });
    });
  });

  return Promise.all(articlesToSave).then(function returnFinishedObject() {
    return {
      lang: languageWikiObject.lang,
      lastUpdated: languageWikiObject.lastUpdated,
      articles: articlesToSave,
    };
  });
}

/**
 * Saves an article to the file system
 * @param {Object} article
 * @param {String} saveLocation
 * @returns {Object} savedArticle
 */

function writeFile(article, saveLocation) {
  return new Promise(function save(resolve, reject) {
    return fsWriteFile(article.wtPath, article.content).then(function successSaveFile() {
      // make relative destination for saving to db and get rid of md on article object because that's been saved to disk
      article.wtPath = path.relative(path.resolve(saveLocation, '..'), article.wtPath);
      delete article.content;
      // log.debug(article.title + ' saved.');
      return resolve(article);
    }).catch(function catchSaveFile(err) {
      log.error(err);
      log.error(err.stack);
      return reject(article);
    });
  });
}

exports.storeDb = function storeState(objectList, location) {
  var destination = path.resolve(location, 'db.json');
  var db = {
    'updated': new Date(),
    'db': objectList,
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
