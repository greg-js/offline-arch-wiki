#!usr/bin/env node

'use strict';

var log = require('../lib/util').log;
var scrape = require('../lib/scrape');
var files = require('../lib/files');
var path = require('path');

var uniq = require('lodash').uniq;

var location = process.argv[2] ? path.resolve(process.argv[2], 'offline-arch-wiki') : path.resolve('content');
var toc = process.argv[3] || 'https://wiki.archlinux.org/index.php/Table_of_contents';
var doneList;

Promise.resolve(loadDb(location)).then(function parseDb(loadedDb) {
  doneList = loadedDb;
  log.debug('starting parseDb');
  return initScrape(toc, doneList);
}).then(function getCategories(catUrls) {
  log.debug('starting getCategories');
  return Promise.all(processCategories(catUrls)).then(function parseCat(cObjects) {
    log.debug('starting parseCat');
    return cObjects;
  });
}).then(function getArticles(cObjects) {
  log.debug('starting getArticles');
  return Promise.all(processArticles(cObjects)).then(function parseArt(scraped) {
    log.debug('parseArt');
    return scraped;
  });
}).then(function storeArticles(scrapedArticles) {
  log.debug('starting storeArticles');
  return Promise.all(saveArticles(scrapedArticles)).then(function updateDoneList() {
    log.debug('starting updateDoneList');
    return files.storeDb(doneList, location);
  });
}).then(function successMake(loc) {
  log.debug('Db saved to ' + loc);
});

function loadDb(loc) {
  return Promise.resolve(files.loadDb(path.join(loc, 'db.json'))).then(function parseList(doneListString) {
    return JSON.parse(doneListString).doneList || [];
  });
}

function initScrape(TOC) {
  // scrape TOC to get categories
  return Promise.resolve(scrape.toc(TOC)).then(function processToc(categoryUrls) {
    return categoryUrls;
  });
}

function processCategories(cUrls) {
  // scrape category urls to get objects that hold arrays with the category's articles and subcategories
  return cUrls.map(function makePromises(cUrl) {
    return Promise.resolve(scrape.category(cUrl)).then(function successScrape(cObj) {
      return cObj;
    });
  });
}

function processArticles(categoryObjects) {
  return categoryObjects.map(function getArticleArrays(cObj) {
    return uniq(cObj.articles);
  }).map(function makeArticleArrays(articles) {
    return new Promise(function newPromise(resolve) {
      var scrapedArticles = articles.map(function makePromises(article) {
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

function saveArticles(scrapedCategories) {
  return scrapedCategories.map(function makePromiseArrays(scrapedArticles) {
    return new Promise(function newPromiseArray(resolve) {
      var savedArticles = scrapedArticles.filter(function filterArticles(article) {
        var exists = existsAlready(article, doneList);
        if (exists) {
          log.debug(article.title + ' exists. Skipping.');
        }
        return !exists;
      }).map(function makePromises(article) {
        return Promise.resolve(files.save(article, location)).then(function successSave(savedArticle) {
          doneList.push(savedArticle);
          return savedArticle;
        });
      });

      return Promise.all(savedArticles).then(function resolveThem(savedArticleLists) {
        return resolve(savedArticleLists);
      });
    });
  });
}

function existsAlready(article) {
  return doneList.some(function check(doneArticle) {
    return doneArticle.title === article.title;
  });
}

//           function saveArticle(pageObj) {
//             // check first if the
//             if (!doneList.some(function checkIfExists(doneArticle) {
//               return doneArticle.title === pageObj.title;
//             })) {
//               Promise.resolve(files.save(pageObj, location)).then(function updateDb(savedPageObj) {
//                 doneList.push(savedPageObj);
//                 log.debug(savedPageObj.title + ' saved.');
//               });
            // } else {
            //   log.debug(pageObj.title + ' exists. Skipping.');
            // }
          // });

//         // process every article in a given category
//         catObj.articles.forEach(function forEachArticle(articleObj) {
//           // scrape every article in the category to get back a page obj and save it to disk
//           Promise.resolve(scrape.article(articleObj)).then(i
//           function saveArticle(pageObj) {
//             // check first if the
//             if (!doneList.some(function checkIfExists(doneArticle) {
//               return doneArticle.title === pageObj.title;
//             })) {
//               Promise.resolve(files.save(pageObj, location)).then(function updateDb(savedPageObj) {
//                 doneList.push(savedPageObj);
//                 log.debug(savedPageObj.title + ' saved.');
//               });
            // } else {
            //   log.debug(pageObj.title + ' exists. Skipping.');
            // }
          // });
        // });
      // });
    // });

    // return doneList;
  // }).then(function saveDoneList(newList) {
    // Promise.resolve(files.store(newList, location)).then(function successMake(doneLoc) {
      // log.info('Successfully scraped the Arch Wiki.\nContents saved as markdown to ' + doneLoc);
    // });
  // });
// }).catch(function failLoadDb(err) {
  // log.debug(console.trace());
  // log.error(err);
// });


// // scrape TOC to get categories
// Promise.resolve(scrape.toc(toc)).then(function scrapeToc(categoryUrls) {
//   // scrape every category to get articles and subcategories
//   categoryUrls.forEach(function forEachCategory(catUrl) {

//     Promise.resolve(scrape.category(catUrl)).then(function scrapeCategory(catObj) {
//       // process every article in a given category
//       catObj.articles.forEach(function forEachArticle(articleObj) {

//           // scrape every article in the category to get back a page obj
//         Promise.resolve(scrape.article(articleObj)).then(function saveArticle(pageObj) {
//           if (!doneList.some(function checkIfExists(doneArticle) {
//             return doneArticle === pageObj.title;
//           })) {
//             Promise.resolve(files.save(pageObj, location)).then(function makeLink(savedPageObj) {
//               doneList.push(savedPageObj.title);
//               log.debug(savedPageObj.title + ' saved.');
//             });
//           } else {
//             log.debug(pageObj.title + ' exists. Skipping.');
//           }
//         });
//       });
//     });
//   });
// });
