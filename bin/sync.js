#!/usr/bin/env node

'use strict';

var util = require('../lib/util');
var log = require('../lib/util').log;
var scrape = require('../lib/scrape');
var files = require('../lib/files');

var _ = require('lodash');

var path = require('path');

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

var changeLogUrl = 'https://wiki.archlinux.org/index.php?namespace=0&hidebots=&limit=500&from=AAAA&title=Special%3ARecentChanges';
var doneList;

var lastUpdated;
var fromDate;

log.debug(location);
log.debug(JSON.stringify(yargs));

// load the database if it exists
Promise.resolve(loadDb(location)).then(function parseDb(loadedDb) {
  doneList = loadedDb.doneList;
  lastUpdated = new Date(loadedDb.updated);

  log.debug('lastUpdated = ' + lastUpdated);
  if (!lastUpdated) {
    console.log('Invalid existing database. You must run `make-arch-wiki` at least once before being able to sync');
    process.exit();
  } else {
    if (lastUpdated.getMinutes() < 3 && lastUpdated.getHours() % 6 === 0) {
      // this means we are likely dealing with cron-run update
      fromDate = util.toArchDate(lastUpdated);
      log.debug(lastUpdated.getHours() + ':' + lastUpdated.getMinutes());
    } else {
      // this means we may be dealing with a self-run update - default to midnight that day
      fromDate = util.toArchDate(util.setMidnight(lastUpdated));
      log.debug(lastUpdated.getHours() + ':' + lastUpdated.getMinutes());
    }
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
  if (!articles.length) {
    log.info('No articles have been updated since the last sync. Exiting.');
    process.exit();
  }
  return _.uniq(articles, 'title').map(function makePromises(article) {
    return new Promise(function newPromise(resolve, reject) {
      resolve(scrape.article(article));
    });
  });
}

// save an array of articles
function saveArticles(scrapedArticles) {
  return scrapedArticles.map(function makePromises(article) {
    return new Promise(function newPromise(resolve) {
      Promise.resolve(files.save(article, location)).then(function successSave(savedArticle) {
        if (!(_.find(doneList, function findArticle(a) { return a.title === savedArticle.title; }))) {
          doneList.push(savedArticle);
        }
        return resolve(savedArticle);
      });
    });
  });
}
