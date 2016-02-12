#!/usr/bin/env node

'use strict';

var log = require('../lib/util').log;
var path = require('path');
var splitLanguages = require('../lib/util').splitLanguages;
var buildArticleObjectList = require('../lib/fetch').buildArticleObjectList;
var save = require('../lib/files').saveEverything;
var loadDb = require('../lib/files').loadDb;
var storeDb = require('../lib/files').storeDb;
var fixDb = require('../lib/util').fixDb;

var yargs = require('yargs')
  .usage('Usage: $0 [-t target-dir]')
  .default('t', path.join(__dirname, '..', 'content'))
  .alias('t', 'target-dir')
  .describe('t', 'path to custom local wiki location')
  .help('h')
  .alias('h', 'help')
  .argv;

var location = yargs.t;
var db;
var opts = yargs.opts || {};

// load the database if it exists
loadState(location).then(function parseDb(loadedDb) {
  db = loadedDb;
  return buildArticleObjectList(opts);
}).then(function splitArticleObjects(articleObjectList) {
  return splitLanguages(articleObjectList);
}).then(function saveArticles(splitObjectList) {
  return save(splitObjectList, location);
}).then(function storeState(finishedObjectList) {
  return storeDb(finishedObjectList, location);
}).then(function done() {
  log.info('Local copy saved to ' + location);
}).catch(function oops(err) {
  log.error(err.message);
  log.error(err.stack);
});

// get the doneList array from the db.json file if it exists
function loadState(loc) {
  return loadDb(path.join(path.resolve(loc), 'db.json')).then(function parseList(doneListString) {
    return JSON.parse(doneListString).db;
  });
}
