#!/usr/bin/env node

'use strict';

var log = require('../lib/util').log;
var path = require('path');
var splitLanguages = require('../lib/util').splitLanguages;
var buildArticleObjectList = require('../lib/fetch').buildArticleObjectList;
var save = require('../lib/files').saveEverything;
var loadDb = require('../lib/files').loadDb;
var storeDb = require('../lib/files').storeDb;

var yargs = require('yargs')
  .usage('Usage: $0 [-t target-dir]')
  .default('t', path.join(__dirname, '..', 'content'))
  .alias('t', 'target-dir')
  .describe('t', 'path to custom local wiki location')
  .default('c', 'https://wiki.archlinux.org/index.php/Table_of_Contents')
  .alias('c', 'table-of-contents')
  .describe('c', 'path or url to custom wiki TOC (default: https://wiki.archlinux.org/index.php/Table_of_Contents)')
  .help('h')
  .alias('h', 'help')
  .argv;

var location = yargs.t;
var toc = yargs.c;

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
// }).then(function write(splitObjectList) {
//   return require('fs').writeFile(require('path').resolve('/tmp/results'), JSON.stringify(articleObjectList));
}).then(function done() {
  console.log('done');
}).catch(function oops(err) {
  console.log(err.message);
  console.log(err.stack);
});

// get the doneList array from the db.json file if it exists
function loadState(loc) {
  return loadDb(path.join(path.resolve(loc), 'db.json')).then(function parseList(doneListString) {
    return JSON.parse(doneListString).db;
  });
}

