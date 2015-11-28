'use strict';

// module.exports = function modExp(tocLink) {
//   var util = require('./lib/util.js');
//   var processTOC = require('./lib/process-toc');
//   var toMD = require('./lib/to-md');
//   var scrape = require('./lib/scrape');
//   var save = require('./lib/save');
//   var mkDir = require('./lib/mk-dir');
//   var mkLink = require('./lib/mk-link');

//   return {

//   }

//   var donelist = [];

//   // lists.articles & lists.categories hold arrays
//   var lists = processTOC(tocLink);

//   tocLink = tocLink || 'https://wiki.archlinux.org/index.php/Table_of_contents';

//   lists.categories.forEach(function forEachCat(category) {
//     mkDir(category);
//     donelist.push(category);
//   });

//   lists.articles.forEach(function forEachArticle(article) {
//     Promise.resolve(scrape(article)).then(function scrapeSuccess(innerHTML) {
//       save(toMD(innerHTML));
//       mkLink(article);
//       donelist.push(article);
//     }).catch(function scrapeFail(err) {
//       console.log(err);
//     });
//   });


// };

