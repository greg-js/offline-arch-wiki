#!/usr/bin/env node

'use strict';

var log = require('../lib/util').log;
var setMidnight = require('../lib/util').setMidnight;
var buildSyncList = require('../lib/fetch').buildSyncList;
var splitLanguages = require('../lib/util').splitLanguages;
var saveToDisk = require('../lib/files').saveEverything;
var loadDb = require('../lib/files').loadDb;
var updateDb = require('../lib/files').updateDb;
var fixDb = require('../lib/util').fixDb;

var _ = require('lodash');

var path = require('path');

var yargs = require('yargs')
  .usage('Usage: $0 [-t target-dir]')
  .default('t', path.join(__dirname, '..', 'content'))
  .alias('t', 'target-dir')
  .describe('t', 'path to custom local wiki location')
  .default('w', false)
  .alias('w', 'wikitext')
  .describe('w', 'fetch wikitext (much faster, but difficult to parse)')
  .default('m', true)
  .alias('m', 'markdown')
  .describe('m', 'fetch markdown (slow, but easy to parse)')
  .help('h')
  .alias('h', 'help')
  .argv;

var location = yargs.t;
var oldDb;

var lastUpdated;
var opts = yargs.opts || {};
var len;

var doWikitext = yargs.w;

// load the database if it exists
loadState(location).then(function fetchChanges(loadedDb) {
  var fromDate;
  oldDb = loadedDb.db;
  lastUpdated = new Date(loadedDb.updated);

  if (!lastUpdated) {
    log.error('Invalid existing database. You must run `build-arch-wiki` at least once before being able to sync');
    process.exit();
  }
  // cron-mode has absolute date start, default checks from midnight that day
  // fromDate = (cron) ? lastUpdated : setMidnight(lastUpdated);
  fromDate = setMidnight(lastUpdated);
  return buildSyncList(opts, fromDate, doWikitext);
}).then(function splitArticleObjects(syncObjectList) {
  len = syncObjectList.length;
  return splitLanguages(syncObjectList);
}).then(function updateArticles(splitObjectList) {
  return saveToDisk(splitObjectList, location, doWikitext);
}).then(function storeState(newDb) {
  return updateDb(oldDb, newDb, location, doWikitext);
}).then(function done() {
  log.info(len + ' articles updated.');
}).catch(function oops(err) {
  log.error(err.message);
  log.error(err.stack);
});

// get the doneList array from the db.json file if it exists
function loadState(loc) {
  return loadDb(path.join(path.resolve(loc), 'db.json')).then(function parseList(doneListString) {
    return JSON.parse(doneListString);
  });
}
