'use strict';

var log = require('./util').log;
var toMD = require('./to-md');

var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));

var uniq = require('lodash').uniq;
var cheerio = require('cheerio');

/**
 * Scrapes a wiki article URL and returns an object with the title and relevant content, converted to markdown
 * @param {String} url
 * @returns {Object} article
 * @returns {String} article.title - the title of the article
 * @returns {String} article.md - the markdown for the article
 */

exports.article = function scrapeArticle(url) {
  var request = require('request-promise');

  var title = url.substr(url.lastIndexOf('/') + 1);

  return request(url).then(function successScrape(htmlString) {
    var $ = cheerio.load(htmlString);
    var md;

    return {
      title: title,
      md: toMD($('#content').toString()),
    };
  }).catch(function failScrape(err) {
    log.error('Article scrape failed: ' + err);
  });
};

/**
 * Scrapes a wiki category URL and returns a list of article URLs
 * @param {String} url
 * @return {Array} linklist
 */

exports.category = function scrapeCategory(url) {
  var request = require('request-promise');

  var title = url.substr(url.lastIndexOf(':') + 1);

  return request(url).then(function successScrape(htmlString) {
    var $ = cheerio.load(htmlString);

    return {
      title: title,
      urls: $('#mw-pages li a').map(function mapUrls() {
        return 'https://wiki.archlinux.org' + $(this).attr('href').toString();
      }).toArray(),
    };
  }).catch(function failScrape(err) {
    log.error('Category scrape failed: ' + err);
  });
};

/**
 * Scrapes the arch wiki's table of contents and returns a list of category URLs
 * @param {String} arch wiki TOC url (optional)
 * @return {Array} categoryLinklist
 */

exports.toc = function scrapeToc(url) {
  var request = require('request-promise');

  return request(url).then(function successScrape(htmlString) {
    var $ = cheerio.load(htmlString);

    return uniq($('#mw-content-text dd a').map(function mapUrls() {
      return $(this).attr('href');
    }).toArray());
  }).catch(function failScrape(err) {
    log.error('TOC scrape failed: ' + err);
  });
};
