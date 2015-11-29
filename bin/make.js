#!usr/bin/env node

'use strict';

var scrape = require('../lib/scrape');
var files = require('../lib/files');
var path = require('path');

var wd = '../content';

var location = process.argv[2] ? path.resolve(process.argv[2]) : path.resolve('content/_content');
var toc = process.argv[3] || 'https://wiki.archlinux.org/index.php/Table_of_contents';

// scrape TOC to get categories
Promise.resolve(scrape.toc(toc)).then(function scrapeToc(categoryUrls) {

  // scrape every category to get articles and subcategories
  categoryUrls.forEach(function forEachCategory(catUrl) {

    Promise.resolve(scrape.category(catUrl)).then(function scrapeCategory(catObjs) {

      // process every category in order
      catObjs.forEach(function forEachCatObj(catObj) {

        // process every article in a given category
        catObj.articles.forEach(function forEachArticle(articleObj) {

          // scrape every article in the category to get back a page obj
          Promise.resolve(scrape.article(articleObj)).then(function saveArticle(pageObj) {

            // save the page's contents as markdown, then make a link
            Promise.resolve(files.save(pageObj, location)).then(function makeLink(savedPageObj) {

            });
          });
        });

      });
    });
  });
});
