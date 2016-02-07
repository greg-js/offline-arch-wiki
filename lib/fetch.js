'use strict';

var Promise = require('bluebird');
var writeFile = Promise.promisify(require('fs').writeFile);
var Nodemw = require('nodemw');
var archwiki = new Nodemw({
  protocol: 'https',
  server: 'wiki.archlinux.org',
  path: '',
  debug: false,
  userAgent: 'arch-wiki-md-repo/2.0 (https://github.com/greg-js/arch-wiki-md-repo; greg@gregjs.com) Using nodemw Node.js mediawiki library',
  concurrency: 1,
});

var log = require('./util').log;

exports.buildUrlList = buildUrlList;
exports.buildArticleObjectList = buildArticleObjectList;

/**
 * Queries the wiki and returns a list of article objects with article id, title and url
 * @param {Object} options - the options object, most important properties include baseUrl, continue and gapcontinue
 * @return {Array} urlList
 **/
function buildUrlList(opts) {
  return new Promise(function makePromise(resolve, reject) {
    var options = {
      action: opts.action || 'query',
      generator: opts.generator || 'allpages',
      gaplimit: opts.gaplimit || 'max',
      gapfilterredir: opts.gapfilterredir || 'nonredirects',
      // gapnamespace: opts.gapnamespace || '0',
      prop: opts.prop || 'info',
      inprop: opts.inprop || 'url',
      format: opts.format || 'json',
      formatversion: opts.formatversion || '2',
      continue: opts.continue || '',
      gapcontinue: opts.gapcontinue || '',
      rvcontinue: opts.rvcontinue || '',
    };

    return fetchBatch(options, [], function getPages(err, urlList) {
      if (err) { reject(err); }
      return resolve(urlList);
    });

    /**
     * Queries the wiki and returns a JSON object with results
     * @param {Object} parameters
     * @param {Array} list
     * @param {Function} callback
     * @return {Array} urlList
     **/
    function fetchBatch(parameters, list, callback) {
      var urls = list || [];

      archwiki.api.call(parameters, function fetchCB(err, info, next, data) {
        if (err) { callback(err); }

        urls = urls.concat(data.query.pages);

        if (next) {
          parameters.continue = next.continue;
          parameters.gapcontinue = next.gapcontinue;
          fetchBatch(parameters, urls, callback);
        } else {
          callback(null, urls);
        }
      });
    }
  });
}

/**
 * Takes a list of article objects from the previous query response and adds data to each object
 * @param {Array} urlList
 * @return {Array} articleObjectList
 **/
function buildArticleObjectList(urlList, opts) {
  var total = urlList.length;
  var options = {
    action: opts.action || 'parse',
    text: opts.text || 'contentmodel',
    pageid: opts.pageid || urlList[0].pageid,
    prop: opts.prop || 'text',
    format: opts.format || 'json',
    formatversion: opts.formatversion || '2',
  };

  var articlePromises = urlList.map(function makePromises(article) {
    return new Promise(function makePromise(resolve, reject) {
      var articleObject = {
        pageid: article.pageid,
        title: article.title,
        length: article.length,
        lastrevid: article.lastrevid,
        url: article.fullurl,
      };

      options.pageid = article.pageid;

      return fetchArticle(options, function getContents(err, data) {
        if (err) { reject(err); }
        articleObject.text = data.text;
        // articleObjectList.push(articleObject);

        return resolve(articleObject);
      });
    });
  });

  return Promise.all(articlePromises).then(function getList(articleObjectList) {
    return articleObjectList;
  });

  function fetchArticle(parameters, callback) {
    archwiki.api.call(parameters, function fetchCB(err, info, next, data) {
      if (err) { callback(err); }

      callback(null, {
        text: data.parse.text,
      });
    });
  }
}
