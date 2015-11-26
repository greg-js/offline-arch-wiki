'use strict';

var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));
var path = require('path');
// var async = require('async');

var request = require('request-promise');
var cheerio = require('cheerio');

var toMD = require('./util').toMD;

var dest = '/home/greg/dev/nodejs/offline-arch-wiki/content/_content';
var linkDest = '/home/greg/dev/nodejs/offline-arch-wiki/content/1 About Arch/1.1 Arch Development/1.1.1 Package Development';

// var scrapeUrl = 'https://wiki.archlinux.org/index.php/Category:Package_development';

// function traverseTOC() {
//   var toc = 'https://wiki.archlinux.org/index.php/Table_of_contents';

//   request(toc).then(function successTOC(htmlString) {
//     var $ = cheerio.load(htmlString);

//     $('.mw-content-text a')
//   })

// }

// function getLinks

module.exports = function scrapeLinkList(scrapeUrl) {
  request(scrapeUrl).then(function successScrape(htmlString) {
    var $ = cheerio.load(htmlString);

    $('.mw-category-group li a').map(function mapUrls() {
      return 'https://wiki.archlinux.org' + $(this).attr('href').toString();
    }).each(function forEachUrl() {
      var url = this.toString();
      var title = url.substr(url.lastIndexOf('/'));
      request(url).then(function successSubScrape(subHtmlString) {
        var $$ = cheerio.load(subHtmlString);
        var out = path.join(dest, title) + '.md';

        var content = toMD($$('#content').toString());

        fs.statAsync(out).then(function checkFile(stats) {
          if (!stats.isFile()) {
            fs.writeFileAsync(out, content).then(function writeMD() {
              var symlinkDest = path.join(linkDest, title);

              console.log(url + ' saved to ' + out);
              fs.symlinkAsync(out, symlinkDest).then(function successMakeLink() {
                console.log(out + ' linked to ' + symlinkDest);
              }).catch(function failMakeLink(err) {
                console.log('symlink failed: ' + err);
              });
            });
          } else {
            console.log(out + ' already exists. Skipping...');
          }
        });

      }).catch(function failSubScrape(err) {
        console.log('subScrape failed: ' + err);
      });
    });
  }).catch(function failScrape(err) {
    console.log('Arch wiki crawl failed: ' + err);
  });
};
