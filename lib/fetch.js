'use strict';

var Promise = require('bluebird');
var writeFile = Promise.promisify(require('fs').writeFile);
var Nodemw = require('nodemw');
var archwiki = new Nodemw({
  protocol: 'https',
  server: 'wiki.archlinux.org',
  path: '',
  debug: true,
  userAgent: 'arch-wiki-md-repo testing API',
});

var log = require('./util').log;

exports.buildUrlList = buildUrlList;

/**
 * Queries the wiki and returns a list of article objects with article id, title and url
 * @param {Object} options - the options object, most important properties include baseUrl, continue and gapcontinue
 * @return {Array} urlList
 **/
function buildUrlList(opts) {
  var options = {
    action: opts.action || 'query',
    generator: opts.generator || 'allpages',
    gaplimit: opts.gaplimit || 'max',
    gapfilterredir: opts.gapfilterredir || 'nonredirects',
    // gapnamespace: opts.gapnamespace || '0',
    prop: opts.prop || ['info', 'revisions'].join('|'),
    inprop: opts.inprop || 'url',
    formatversion: opts.formatversion || '2',
    continue: opts.continue || '',
    gapcontinue: opts.gapcontinue || '',
  };

  return fetchBatch(options, [], function getPages(err, urlList) {
    if (err) { throw err; }
    return urlList;
  });

  /**
   * Queries the wiki and returns a JSON object with results
   * @param {String} url
   * @return {Object} wikiResponse
   **/
  function fetchBatch(parameters, list, callback) {
    var urls = list || [];

    archwiki.api.call(parameters, function fetchCB(err, info, next, data) {
      if (err) { callback(err); }

      console.log(next);

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
}

