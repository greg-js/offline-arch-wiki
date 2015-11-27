'use strict';

var log = require('./util').log;
var toMD = require('./to-md');

var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));
var path = require('path');

var cheerio = require('cheerio');

// var scrapeUrl = 'https://wiki.archlinux.org/index.php/Category:Package_development';

/**
 * Scrapes a wiki article URL and returns an object with the title and relevant content, converted to markdown
 * @param {String} url
 * @returns {Object} article
 * @returns {String} article.title - the title of the article
 * @returns {String} article.md - the markdown for the article
 */
exports.article = function scrapeArticle(url) {
  var request = require('request-promise');

  var title = url.substr(url.lastIndexOf('/'));
  request(url).then(function successSubScrape(subHtmlString) {
    var $ = cheerio.load(subHtmlString);
    var md = toMD($('#content').toString());

    return {
      title: title,
      md: md,
    };

  }).catch(function failSubScrape(err) {
    log.error('subScrape failed: ' + err);
  });
};

/**
 * Scrapes a wiki category URL and returns a list of article URLs
 * @param {String} url
 * @return {Array} linklist
 */

exports.category = function scrapeCategory(url) {
  var request = require('request-promise');

  request(url).then(function successScrape(htmlString) {
    var $ = cheerio.load(htmlString);

    return $('.mw-category li a').map(function mapUrls() {
      return 'https://wiki.archlinux.org' + $(this).attr('href').toString();
    });
  }).catch(function failScrape(err) {
    log.error('Arch wiki crawl failed: ' + err);
  });
};


