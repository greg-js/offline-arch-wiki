#!/usr/bin/env node

'use strict';

var util = require('../lib/util');
var log = require('../lib/util').log;
var scrape = require('../lib/scrape');
var files = require('../lib/files');

var _ = require('lodash');

var path = require('path');

var ProgressBar = require('progress');

var yargs = require('yargs')
  .usage('Usage: $0 [-t target-dir] [-c cron]')
  .default('t', path.join(__dirname, '..', 'content'))
  .alias('t', 'target-dir')
  .describe('t', 'path to custom local wiki location')
  .boolean('c')
  .default('c', false)
  .alias('c', 'cron')
  .describe('c', 'cron-mode (force 8h intervals)')
  .help('h')
  .alias('h', 'help')
  .argv;

var location = yargs.t;
var cron = yargs.c;
var changeLogUrl = 'https://wiki.archlinux.org/index.php?title=Special:RecentChanges&from=AAAA&hidebots=0&namespace=0&limit=500';
var doneList;

var lastUpdated;
var fromDate;

var bar = null;
// load the database if it exists
Promise.resolve(loadDb(location)).then(function parseDb(loadedDb) {
  doneList = loadedDb.doneList;
  lastUpdated = new Date(loadedDb.updated);

  if (!lastUpdated) {
    log.error('Invalid existing database. You must run `make-arch-wiki` at least once before being able to sync');
    process.exit();
  } else {
    // cron-mode has absolute date start, default checks from midnight that day
    fromDate = (cron) ? util.toArchDate(lastUpdated) : util.toArchDate(util.setMidnight(lastUpdated));
  }
  return changeLogUrl.replace(/AAAA/, fromDate);
}).then(function getChanges(url) {
  return initScrape(url);
}).then(function updateChanges(articles) {
  return Promise.all(scrapeArticles(articles)).then(function storeArticles(scrapedArticles) {
    return Promise.all(saveArticles(scrapedArticles)).then(function updateDb(arts) {
      log.info(arts.length + ' articles updated.');
      return files.storeDb(doneList, location);
    });
  });
}).then(function logDate(destination) {
  log.info('Db saved to ' + destination);
}).catch(function catchSync(err) {
  log.error(err);
});

// get the doneList array from the db.json file if it exists
function loadDb(loc) {
  return Promise.resolve(files.loadDb(path.join(loc, 'db.json'))).then(function parseList(db) {
    return JSON.parse(db);
  });
}

function initScrape(url) {
  return Promise.resolve(scrape.changes(url)).then(function parseChanges(changes) {
    return changes;
  });
}

function scrapeArticles(articles) {
  return _.uniq(articles, 'title').map(function makePromises(article) {
    var scrapeBar = scrapeBar || new ProgressBar('Syncing local wiki... [:bar] :percent :etas', {
      complete: '=',
      incomplete: ' ',
      width: 25,
      total: articles.length,
      clear: true,
    });

    return new Promise(function newPromise(resolve, reject) {
      resolve(scrape.article(article, scrapeBar));
    });
  });
}

// save an array of articles
function saveArticles(scrapedArticles) {
  var saveBar = saveBar || new ProgressBar('Saving changes... [:bar] :percent :etas', {
    complete: '=',
    incomplete: ' ',
    width: 25,
    total: scrapedArticles.length,
    clear: true,
  });

  return scrapedArticles.map(function makePromises(article) {
    return new Promise(function newPromise(resolve) {
      Promise.resolve(files.save(article, location)).then(function successSave(savedArticle) {
        if (!(_.find(doneList, function findArticle(a) { return a.title === savedArticle.title; }))) {
          doneList.push(savedArticle);
        }
        saveBar.tick();
        return resolve(savedArticle);
      });
    });
  });
}
