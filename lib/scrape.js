'use strict';

var log = require('./util').log;
var toMD = require('./to-md');

var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));

var cheerio = require('cheerio');

/**
 * Scrapes a wiki article URL and returns an object with the title and relevant content, converted to markdown
 * @param {Object} articleObj
 * @param {String} articleObj.url - the url of the article
 * @param {String} articleObj.parentCat - the title of the parent category
 * @returns {Object} article
 * @returns {String} article.title - the title of the article
 * @returns {String} article.md - the markdown for the article
 * @returns {String} article.parentCat - the title of the parent category
 */

exports.article = function scrapeArticle(articleObj) {
  var request = require('request-promise');
  var url = articleObj.url;
  var cat = articleObj.parentCat;

  return request(url).then(function successScrape(htmlString) {
    var $ = cheerio.load(htmlString);
    var md;

    return {
      title: $('#firstHeading').text(),
      md: toMD($('#content').toString()),
      parentCat: cat,
    };
  }).catch(function failScrape(err) {
    log.error('Article scrape failed: ' + err);
  });
};

/**
 * Scrapes a wiki category URL and returns a list of article URLs
 * @param {String} url
 * @return {Object} category
 * @return {Array} category.subcategories
 * @return {Array} category.articles
 **/

exports.category = function scrapeCategory(url) {
  var request = require('request-promise');

  return request(url).then(function successScrape(htmlString) {
    var $ = cheerio.load(htmlString);
    var title = $('#firstHeading').text().replace(/Category:/, '');

    return {
      subcategories: $('#mw-subcategories li a').map(function mapSubCats() {
        return {
          title: $(this).text().replace(/Category:/, ''),
          url: 'https://wiki.archlinux.org' + $(this).attr('href'),
        };
      }).toArray(),
      articles: $('#mw-pages li a').map(function mapUrls() {
        return {
          parentCategory: title,
          url: 'https://wiki.archlinux.org' + $(this).attr('href'),
        };
      }).toArray(),
    };
  }).catch(function failScrape(err) {
    log.error('Category scrape failed: ' + err);
  });
};

/**
 * Scrapes the arch wiki's table of contents and returns a list of category URLs
 * @param {String} arch wiki TOC url
 * @return {Array} categoryLinklist
 */

exports.toc = function scrapeToc(url) {
  var request = require('request-promise');

  return request(url).then(function successScrape(htmlString) {
    var $ = cheerio.load(htmlString);

    return $('#mw-content-text dd a').filter(function filterUnordered() {
      // if /also/ appears in parent, the category is out of order (see the arch wiki TOC)
      return !(/also/.test($(this).parent().text()));
    }).map(function mapUrls() {
      return 'https://wiki.archlinux.org' + $(this).attr('href');
    }).toArray();
  }).catch(function failScrape(err) {
    return fs.statAsync(url).then(function getStats(stats) {
      if (stats.isFile()) {
        return fs.readFileAsync(url, 'utf-8').then(function successRead(htmlString) {
          var $ = cheerio.load(htmlString);
          return $('#mw-content-text dd a').filter(function filterUnordered() {
            return !(/also/.test($(this).parent().text()));
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
