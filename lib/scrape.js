'use strict';

var http = require('http');
var https = require('https');

var log = require('./util').log;
var isGoodArticle = require('./util').isGoodArticle;
var toMD = require('./to-md');
var sanitize = require('sanitize-filename');

var uniq = require('lodash').uniq;
var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));

var cheerio = require('cheerio');

http.globalAgent.maxSockets = 1;
https.globalAgent.maxSockets = 1;

/**
 * Scrapes the recent changes page of a wiki and returns a list of all the changed articles
 * @param {String} url
 * @returns {Array} changesArray - array of article objects, each with a url property
 **/
exports.changes = function scrapeChanges(url) {
  var request = require('request-promise');

  return request(url).then(function successScrape(htmlString) {
    var $ = cheerio.load(htmlString);

    return $('.mw-changeslist .mw-title a').map(function mapUrls(article) {
      return {
        url: 'https://wiki.archlinux.org' + $(this).attr('href'),
        title: $(this).attr('title'),
      };
    }).toArray().filter(function filterArticles(article) {
      return isGoodArticle(article);
    });
  }).catch(function failScrape() {
    log.info('No articles have been updated since the last sync. Exiting.');
    process.exit();
  });
};

/**
 * Scrapes a wiki article URL and returns an object with the title and relevant content, converted to markdown
 * @param {Object} articleObj
 * @param {String} articleObj.url - the url of the article
 * @returns {Object} article
 * @returns {String} article.title - the title of the article
 * @returns {String} article.md - the markdown for the article
 **/
exports.article = function scrapeArticle(articleObj) {
  var request = require('request-promise');
  var url = articleObj.url;

  return request(url).then(function successScrape(htmlString) {
    var $ = cheerio.load(htmlString);
    var ps = $('#mw-content-text').children();
    var title = sanitize($('#firstHeading').text(), { replacement: '-' });
    var isCategory = /^Category\-/.test(title);

    var description = (isCategory) ? 'Category page' : ps.first().text().trim();
    // if first paragraph starts with "From", make the description the second paragraph instead of the first and so on for four possible description elements
    if (!isTextDescription(description) || !description) {
      description = ps.first().next().text().trim();
      if (!isTextDescription(description) || !description) {
        description = ps.first().next().next().text().trim();
        if (!isTextDescription(description) || !description) {
          description = ps.first().next().next().next().text().trim();
          if (!isTextDescription(description) || !description) {
            description = ps.first().next().next().next().next().text().trim();
          }
        }
      }
    }

    return {
      title: title,
      description: description.replace(/\n/g, ' '),
      md: toMD($('#content').toString()),
      category: isCategory,
      url: url,
    };

    function isTextDescription(text) {
      var badFirstWordsRE = /Contents|From|Related|Warning|See/i;
      var badContentRE = /article or section needs|article is a stub|article or section is out of date|is a candidate for merging|Package creation guidelines|The factual accuracy/i;

      return !badFirstWordsRE.test(text.split(' ')[0]) && !badContentRE.test(text);
    }

  }).catch(function failScrape(err) {
    log.error('Article scrape failed: ' + err);
  });
};

/**
 * Scrapes a wiki category URL and returns a list of article URLs
 * @param {String} url
 * @param {Array} doneList - an array of all already existing articles
 * @return {Object} category
 * @return {Array} category.articles
 * @return {Array} category.url - for scraping as article
 **/
exports.category = function scrapeCategory(url, doneList) {
  var request = require('request-promise');
  var origUrl = url;

  return request(url).then(function successScrape(htmlString) {
    var $ = cheerio.load(htmlString);
    var title = sanitize($('#firstHeading').text(), { replacement: '-' });

    return {
      articles: uniq($('#mw-pages li a').filter(function filterUrls() {
        var articleTitle = $(this).attr('title');
        var exists = existsAlready(articleTitle, doneList);
        if (exists) {
          log.debug(articleTitle + ' exists. Skipping.');
        }

        return !exists;
      }).map(function mapUrls() {
        return {
          url: 'https://wiki.archlinux.org' + $(this).attr('href'),
        };
      }).toArray(), 'url'),
      url: origUrl,
    };
  }).catch(function failScrape(err) {
    log.error('Category scrape failed: ' + err);
  });
};

/**
 * Scrapes the arch wiki's table of contents and returns a list of category URLs
 * @param {String} arch wiki TOC url
 * @return {Array} categoryLinklist
 **/
exports.toc = function scrapeToc(url) {
  var request = require('request-promise');

  return request(url).then(function successScrape(htmlString) {
    var $ = cheerio.load(htmlString);

    return $('#mw-content-text dd a').filter(function filterUnordered() {
      // if the first small doesn't hold a numeric value, the category is out of order (see the arch wiki TOC)
      return $(this).parent().find('small').first().text();
    }).map(function mapUrls() {
      return 'https://wiki.archlinux.org' + $(this).attr('href');
    }).toArray();
  }).catch(function failScrape(err) {
    return fs.statAsync(url).then(function getStats(stats) {
      if (stats.isFile()) {
        return fs.readFileAsync(url, 'utf-8').then(function successRead(htmlString) {
          var $ = cheerio.load(htmlString);
          return $('#mw-content-text dd a').filter(function filterUnordered() {
            return $(this).parent().find('small').first().text();
          }).map(function mapUrls() {
            return 'https://wiki.archlinux.org' + $(this).attr('href');
          }).toArray();
        }).catch(function failRead() {
          log.error('TOC scrape failed: ' + err);
        });
      }
    });
  });
};

/**
 * Checks if a given article title already exists in a list of existing articles
 * @param {String} articleTitle
 * @param {Array} doneList
 * @return {Boolean} exists
 **/
function existsAlready(articleTitle, doneList) {
  return doneList.some(function check(doneArticle) {
    return sanitize(doneArticle.title, { replacement: '-' }).toLowerCase() === sanitize(articleTitle, { replacement: '-' }).toLowerCase();
  });
}
