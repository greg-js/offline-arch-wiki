#!usr/bin/env node

'use strict';

var util = require('util');
var log = util.log;

var scrape = require('../lib/scrape');
var files = require('../lib/files');
var path = require('path');

var location = process.argv[2] ? path.resolve(process.argv[2], 'offline-arch-wiki') : path.resolve('content');

var changeLogUrl = 'https://wiki.archlinux.org/index.php?namespace=0&hidebots=&limit=500&from=AAAA&title=Special%3ARecentChanges';
var doneList;

var lastUpdated;
var fromDate;
// var today = util.setMidnight(new Date());
// var yesterday = util.setDayEarlier(today);

function usage() {
  console.log('Usage: sync-arch-wiki location');
  console.log('    location (optional): path to custom location for saving the wiki (default: ./content)');
  process.exit();
}

if (/\-h|\-\-help/.test(process.argv[2])) {
  usage();
}
// load the database if it exists
Promise.resolve(loadDb(location)).then(function parseDb(loadedDb) {
  doneList = loadedDb.doneList;
  lastUpdated = loadedDb.updated;
  if (!lastUpdated) {
    console.log('Invalid existing database. You must run `make-arch-wiki` at least once before being able to sync');
    usage();
  } else {
    lastUpdated = new Date(lastUpdated);
    if (lastUpdated.getTime() !== util.setMidnight(lastUpdated).getTime()) {
      // this means we are syncing a db that was only just built
      fromDate = util.toArchDate(util.setMidnight(lastUpdated));
    } else {
      // this means we are syncing a db that has been synced before
      fromDate = util.toArchDate(lastUpdated);
    }
  }
  return changeLogUrl.replace(/AAAA/, fromDate);
}).then(function getChanges(url) {
  return initScrape(url);
}).then(function updateChanges(articles) {
  return Promise.all(scrapeArticles(articles)).then(function storeArticles(scrapedArticles) {
    return Promise.all(saveArticles(scrapedArticles)).
      /* TODO
       */
  });
}).then(function updateDb(savedArticles) {

});

// get the doneList array from the db.json file if it exists
function loadDb(loc) {
  return Promise.resolve(files.loadDb(path.join(loc, 'db.json'))).then(function parseList(doneListString) {
    return JSON.parse(doneListString) || [];
  });
}

function initScrape(url) {
  return Promise.resolve(scrape.changes(url)).then(function parseChanges(changesHTML) {

  });
}

function scrapeArticles(articles) {
  return articles.map(function makePromises(article) {
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
        doneList.push(savedArticle);
        return resolve(savedArticle);
      });
    });
  });
}
