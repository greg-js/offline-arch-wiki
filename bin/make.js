#!/usr/bin/env node

'use strict';

var log = require('../lib/util').log;
var scrape = require('../lib/scrape');
var files = require('../lib/files');
var path = require('path');

var flatten = require('lodash').flatten;
var uniq = require('lodash').uniq;

var location = process.argv[2] ? path.resolve(process.argv[2], 'offline-arch-wiki') : path.resolve('content');

var toc = process.argv[3] || 'https://wiki.archlinux.org/index.php/Table_of_contents';

var doneList;
var categoriesAsArticles;

if (/\-h|\-\-help/.test(process.argv[2])) {
  console.log('Usage: build-arch-wiki location wiki');
  console.log('    location (optional): path to custom location for saving the wiki (default: ./content)');
  console.log('    wiki     (optional): path or url to custom wiki TOC (default: https://wiki.archlinux.org/index.php/Table_of_Contents)');
  process.exit();
}

// load in the database if it exists
Promise.resolve(loadDb(location)).then(function parseDb(loadedDb) {
  doneList = loadedDb;
  return initScrape(toc);
// dig through the toc to get to all categories and then find the urls to all articles within them
}).then(function getCategories(catUrls) {
  return Promise.all(processCategories(catUrls)).then(function parseCat(cObjects) {
    return cObjects;
  });
// first scrape all the articles and convert from html to md
}).then(function getArticles(cObjects) {
  return Promise.all(processArticles(cObjects)).then(function parseArt(scrapedArticles) {
    return scrapedArticles;
// then concat them into a big array with all the category pages, also scraped as articles
  }).then(function addCatArts(scrapedArticles) {
    return Promise.all(processCategoriesAsArticles(cObjects)).then(function concatThem(scrapedCats) {
      return flatten(scrapedCats.filter(function filterEmpty(cObj) {
        // there may be some empty objects?
        return !!cObj.title;
      }).concat(scrapedArticles));
    });
  });
// now save the whole array of articles to disk and save the database
}).then(function storeArticles(scrapedArticles) {
  return Promise.all(saveArticles(scrapedArticles)).then(function updateDb() {
    return files.storeDb(doneList, location);
  });
}).then(function successMake(loc) {
  log.debug('Db saved to ' + loc);
});

// get the doneList array from the db.json file if it exists
function loadDb(loc) {
  return Promise.resolve(files.loadDb(path.join(loc, 'db.json'))).then(function parseList(doneListString) {
    return JSON.parse(doneListString).doneList || [];
  });
}

// scrape TOC to get categories
function initScrape(TOC) {
  return Promise.resolve(scrape.toc(TOC)).then(function processToc(categoryUrls) {
    return categoryUrls;
  });
}

// scrape category urls to get objects that hold arrays with the category's article urls
function processCategories(cUrls) {
  return cUrls.map(function makePromises(cUrl) {
    return Promise.resolve(scrape.category(cUrl, doneList)).then(function successScrape(cObj) {
      return cObj;
    });
  });
}

// scrape the articles array in categoryObjects and scrape the content of each article
function processArticles(categoryObjects) {
  return categoryObjects
    .map(function getArticleArrays(cObj) {
      return cObj.articles;
    })
    .map(function makeArticleArrays(articles) {
      return new Promise(function newPromise(resolve) {
        var scrapedArticles = articles.map(function makePromises(article) {
          log.debug('Processing ' + article.url);
          return Promise.resolve(scrape.article(article)).then(function successScrape(scrapedArticle) {
            return scrapedArticle;
          });
        });

        return Promise.all(scrapedArticles).then(function resolveThem(articleObjectLists) {
          return resolve(articleObjectLists);
        });
      });
    });
}

// scrape category pages as if they were articles
function processCategoriesAsArticles(categoryObjects) {
  return categoryObjects.map(function makePromises(article) {
    return new Promise(function newPromise(resolve) {
      resolve(scrape.article(article));
    });
  });
}

// save an array of articles after testing whether they already exist
function saveArticles(scrapedArticles) {
  return uniq(scrapedArticles.filter(function filterArticles(article) {
    var exists = existsAlready(article, doneList);
    if (exists) {
      log.debug(article.title + ' exists. Skipping.');
    }
    return !exists;
  }), 'title').map(function makePromiseArrays(article) {
    return new Promise(function newPromiseArray(resolve) {
      Promise.resolve(files.save(article, location)).then(function successSave(savedArticle) {
        doneList.push(savedArticle);
        return resolve(savedArticle);
      });
    });
  });
}

function existsAlready(article) {
  return doneList.some(function check(doneArticle) {
    return doneArticle.title === article.title;
  });
}
