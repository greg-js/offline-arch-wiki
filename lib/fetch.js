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

// exports.buildUrlList = buildUrlList;
exports.buildArticleObjectList = buildArticleObjectList;

/**
 * Queries the wiki and returns a list of article objects with article id, title and url
 * @param {Object} options - the options object, most important properties include baseUrl, continue and gapcontinue
 * @return {Array} urlList
 **/
function buildArticleObjectList(opts) {
  return new Promise(function makePromise(resolve, reject) {
    var options = {
      action: opts.action || 'query',
      generator: opts.generator || 'allpages',
      gaplimit: opts.gaplimit || '50',
      gapfilterredir: opts.gapfilterredir || 'nonredirects',
      gapnamespace: opts.gapnamespace || '0',
      prop: opts.prop || 'info|revisions',
      rvprop: opts.rvprop || 'content|timestamp',
      inprop: opts.inprop || 'url',
      format: opts.format || 'json',
      formatversion: opts.formatversion || '2',
      continue: opts.continue || '',
      gapcontinue: opts.gapcontinue || '',
    };

    // first build the article objects from the JSON returned from the server
    return fetchBatch(options, [], function getPages(err, objectList) {
      var articleObjectList;
      if (err) { reject(err); }

      // now recast the objects to work in the local database
      articleObjectList = objectList.map(function mapObjects(article) {
        var articleObject = {
          pageid: article.pageid,
          title: article.title,
          length: article.length,
          lastrevid: article.lastrevid,
          url: article.fullurl,
          content: article.revisions[0].content,
          lastMod: article.revisions[0].timestamp,
        };
      });

      return resolve(articleObjectList);
    });

    /**
     * Queries the wiki and returns a JSON object with results
     * @param {Object} parameters
     * @param {Array} list
     * @param {Function} callback
     * @return {Array} urlList
     **/
    function fetchBatch(parameters, list, callback) {
      var objectArray = list || [];

      archwiki.api.call(parameters, function fetchCB(err, info, next, data) {
        if (err) { callback(err); }

        objectArray = objectArray.concat(data.query.pages);

        if (next) {
          parameters.continue = next.continue;
          parameters.gapcontinue = next.gapcontinue;
          fetchBatch(parameters, objectArray, callback);
        } else {
          callback(null, objectArray);
        }
      });
    }
  });
}
