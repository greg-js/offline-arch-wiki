'use strict';

module.exports = function modExp(content, title, folder) {
  var Promise = require('bluebird');

  var fsStat = Promise.promisify(require('fs').stat);
  var fsReadFile = Promise.promisify(require('fs').readFile);
  var fsWriteFile = Promise.promisify(require('fs').writeFile);

  var path = require('path');

  var request = require('request-promise');
  var cheerio = require('cheerio');

  var destination;

  folder = (folder) ? path.resolve(folder) : path.resolve('content/_content');
  destination = path.join(folder, title) + '.md';

  if (!content || !title) {
    console.error('No content or title supplied!');
  }

  fsStat(folder).then(function checkStats(stats) {
    if (!stats.isDirectory()) {
      console.error('Save folder doesn\'t exist!');
    }
  });

  fsWriteFile(destination, content).then(function successSaveFile() {
    console.log(title + ' saved.');
    return title;
  }).catch(function catchSaveFile(err) {
    console.log(err);
  });
};
