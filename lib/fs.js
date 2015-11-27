'use strict';

var log = require('./util').log;

var Promise = require('bluebird');

var fsStat = Promise.promisify(require('fs').stat);
var fsMkdir = Promise.promisify(require('fs').mkdir);
var fsSymlink = Promise.promisify(require('fs').symlink);
var fsReadFile = Promise.promisify(require('fs').readFile);
var fsWriteFile = Promise.promisify(require('fs').writeFile);

var request = require('request-promise');
var cheerio = require('cheerio');

var path = require('path');

/**
 * Saves an article to the file system
 * @param {Object} article
 * @param {String} article.title - the title of the article
 * @param {String} article.md - the markdown for the article
 * @returns {String} title - the title of the article
 */
exports.save = function saveArticle(article, folder) {

  var content = article.md;
  var title = article.title;

  var destination;

  folder = (folder) ? path.resolve(folder) : path.resolve('content/_content');
  destination = path.join(folder, title) + '.md';

  if (!content || !title) {
    log.error('No content or title supplied!');
  }

  fsStat(folder).then(function checkStats(stats) {
    if (!stats.isDirectory()) {
      log.error('Save folder doesn\'t exist!');
    }
  });

  fsWriteFile(destination, content).then(function successSaveFile() {
    log.debug(title + ' saved.');
    return title;
  }).catch(function catchSaveFile(err) {
    log.error(err);
  });
};

exports.mkDir = function makeDirectory(categoryTitle, relativePath) {
  if (!relativePath || !categoryTitle) {
    log.error('Title and path must be supplied');
  }
};

exports.mkLink = function makeLink(articlePath, linkPath) {
  var linkDest = '/home/greg/dev/nodejs/offline-arch-wiki/content/1 About Arch/1.1 Arch Development/1.1.1 Package Development';

        // var symlinkDest = path.join(linkDest, title);

        // log.debug(url + ' saved to ' + out);
        // fs.symlinkAsync(out, symlinkDest).then(function successMakeLink() {
        //   log.debug(out + ' linked to ' + symlinkDest);
        // }).catch(function failMakeLink(err) {
        //   log.error('symlink failed: ' + err);
        // });
      // });
};
