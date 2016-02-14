/* eslint key-spacing:0 */

'use strict';

var Logme = require('logme').Logme;
var Promise = require('bluebird');
var fsMkdir = Promise.promisify(require('fs').mkdir);
var fsReadFile = Promise.promisify(require('fs').readFile);
var fsWriteFile = Promise.promisify(require('fs').writeFile);

var _ = require('lodash');

var languages = {
  arabic:      'العربية',
  bulgarian:   'Български',
  catalan:     'Català',
  czech:       'Česky',
  danish:      'Dansk',
  german:      'Deutsch',
  greek:       'Ελληνικά',
  english:     'English',
  esperanto:   'Esperanto',
  spanish:     'Español',
  persian:     'فارسی',
  finnish:     'Suomi',
  french:      'Français',
  hebrew:      'עברית',
  croatian:    'Hrvatski',
  hungarian:   'Magyar',
  indonesian:  'Indonesia',
  italian:     'Italiano',
  japanese:    '日本語',
  korean:      '한국어',
  lithuanian:  'Lietuviškai',
  dutch:       'Nederlands',
  norwegian:   'Norsk Bokmål',
  polish:      'Polski',
  portuguese:  'Português',
  romanian:    'Română',
  russian:     'Русский',
  slovak:      'Slovenský',
  serbian:     'Српски',
  swedish:     'Svenska',
  thai:        'ไทย',
  turkish:     'Türkçe',
  ukrainian:   'Українська',
  chinesesim:  '简体中文',
  chinesetrad: '正體中文',
};

// log utility
exports.log = new Logme({ level: 'debug' });

// date utilities
exports.toArchDate = toArchDate;
exports.getDateFromLastmod = getDateFromLastmod;
exports.setMidnight = setMidnight;
exports.setDayEarlier = setDayEarlier;

// test utilities
exports.mockRequest = mockRequest;

// filesystem utilities
exports.mkDirs = mkDirs;
exports.mkDir = mkDir;

// misc utilities
exports.makeDescription = makeDescription;
exports.cleanDescription = cleanDescription;
exports.languages = languages;
exports.splitLanguages = splitLanguages;
exports.detectLanguage = detectLanguage;

/**
 * DATE UTILITIES
 **/

/**
 * Converts a JS date object to a string compatible with arch wiki date
 * @param {Object} moment - Date object
 * @returns {String} archDate - YearMoDaHoMiSe
 **/
function toArchDate(moment) {
  var year = moment.getFullYear();
  var month = padWithZero(moment.getMonth() + 1);
  var day = padWithZero(moment.getDate());
  var hour = padWithZero(moment.getHours());
  var minute = padWithZero(moment.getMinutes());
  var second = padWithZero(moment.getSeconds());

  function padWithZero(num) {
    return (num < 10) ? '0' + num : num;
  }

  return [year, month, day, hour, minute, second].join('');
}

function getDateFromLastmod(dateString) {
  var moment = dateString.split(',');
  var date = moment[0].slice(moment[0].search(/\d/));
  var time = moment[1].slice(moment[1].search(/\d/), moment[1].length - 1);

  return new Date([date, time].join(','));
}

/**
 * Sets the time for a given JS date object to 00:00:00
 * @param {Object} moment - Date object
 * @returns {Object} moment - new date object with time set to 00:00:00
 **/
function setMidnight(moment) {
  moment.setHours(0);
  moment.setMinutes(0);
  moment.setSeconds(0);
  return moment;
}

/**
 * Sets the time for a given JS date object to exactly one day earlier
 * @param {Object} moment - Date object
 * @returns {Object} moment - new date object with time set to a day earlier
 **/
function setDayEarlier(moment) {
  var yesterday = new Date(moment);
  var day = yesterday.getDate();
  var month = yesterday.getMonth();
  var year = yesterday.getFullYear();

  if (day !== 1) {
    yesterday.setDate(day - 1);
  } else {
    if (month !== 0) {
      yesterday.setMonth(month - 1);
      if ((month < 7 && month % 2 === 1) || (month >= 7 && month % 2 === 0)) {
        yesterday.setDate(31);
      } else {
        yesterday.setDate(30);
      }
    } else {
      yesterday.setFullYear(year - 1);
      yesterday.setMonth(11);
      yesterday.setDate(31);
    }
  }

  return yesterday;
}

/**
 * TEST UTILITIES
 **/

/**
 * Mocks a request by returning a promise to resolve a given (string) response
 * @param {String} response - the desired response
 * @returns {Promise} responsePromise - response wrapped in a promise, ready to be mocked
 **/
function mockRequest(response) {
  return function makePromise() {
    return new Promise(function promiseFn(resolve, reject) {
      resolve(response);
      reject('mock request failed');
    });
  };
}

/**
 * MISC UTILITIES
 **/

/**
 * Takes in an array of article objects and returns an Array of objects containing
 * language and date information and article object arrays in the specified language
 * @param {Array} articleObjectList
 * @returns {Array} splitObjectList
 **/
function splitLanguages(articleObjectList) {
  var splitObjectList = [];

  articleObjectList.forEach(function splitArray(articleObject) {
    var lang = detectLanguage(articleObject.title);
    if (!(_.find(splitObjectList, { lang: lang }))) {
      splitObjectList.push({
        lang: lang,
        lastUpdated: (new Date()).toISOString(),
        articles: [articleObject],
      });
    } else {
      _.find(splitObjectList, { lang: lang }).articles.push(articleObject);
    }
  });

  return splitObjectList;
}

/**
 * Cleans a description, stripping it from wikitext markup
 **/
function cleanDescription(desc) {
  return desc
    .replace(/\[(.+?)\]\((.+?)\)/, '$1')
    .replace(/\[\[(.+?)\]\]\((.+?)\)/, '$1')
    .replace(/\[http.*\ (.*)\]/g, '$1')
    .replace(/={2,6}|\\?\n|<\/?\\?br>|<\/?s>|[\:;]{1,3}|['"*#\{\}\[\]]/g, '')
    .replace(/\|{1}/g, ' ')
    .replace(/\\?\t/g, ' ')
    .replace(/[\*_](.+?)[\*_]/g, '$1')
  ;
}

/**
 * Takes article content and returns a description (first paragraph if possible)
 * -- only in use when fetching wikitext --
 * @param {String} content
 * @return {String} description
 **/
function makeDescription(content, doWikitext) {
  var splitContent = content.split('\n');
  var firstParagraph;
  var firstWord;
  var splitFirstWord;

  // ignore the first paragraph if it starts with 'from' (means it's a reference to a source)
  if (!splitContent[0] || /^from|^\n/i.test(splitContent[0])) {
    return makeDescription(splitContent.slice(1).join('\n'), doWikitext);
  }

  // just take the first paragraph, whatever it is, if there are very few paragraphs left
  if (splitContent.length < 3) { return cleanDescription(splitContent[0]); }

  if (!doWikitext) {
    return cleanDescription(splitContent[0]);
  }

  if (doWikitext) {
    // ignore the first paragraph if it's empty, a title, a language link or a category link
    if (!splitContent[0][0] || /^==/.test(splitContent[0]) || /^\[\[.{2,5}\:.*\]\]/.test(splitContent[0]) || /^\[\[Category/i.test(splitContent[0])) {
      return makeDescription(splitContent.slice(1).join('\n'));

    // if the first word starts with '{', get ready for a bunch of special cases
    } else if (splitContent[0][0] === '{') {
      firstParagraph = splitContent[0];
      firstWord = firstParagraph.split(/[ \|]/)[0];

      // in some cases it starts with {{Related or {{Note or {{Lowercase, ignore these and skip to next paragraph
      if (/Lowercase|Related|Note|Tip|displaytitle/i.test(firstWord)) {
        return makeDescription(splitContent.slice(1).join('\n'));
      }

      // firstWord can't be split on | in this case so redefine it!!
      firstWord = firstParagraph.split(' ')[0];
      // mental note for future me: this is for splitting {{AUR|something}} kind of constructs
      splitFirstWord = firstWord.match(/^\{+(.*)\|(.*?)\}*$/);

      // somehow this can be null? just return it TODO:fix this later
      if (!splitFirstWord) {
        return cleanDescription(firstParagraph);
      }
      // if it's any kind of link or code, clean up the first word and return it along with the rest of the first paragraph
      if (/pkg|AUR|ic|hc/i.test(splitFirstWord[1])) {
        return cleanDescription([splitFirstWord[2], firstParagraph.split(' ').slice(1).join(' ')].join(' ').replace(/\{\{.*\|(.*?)\}\}/, '$1'));
      }

      // if first character is { but none of these rules apply, just fall through to the second paragraph
      return makeDescription(splitContent.slice(1).join('\n'));
    } else {

      // if none of the special cases apply, the first paragraph is the description
      return cleanDescription(splitContent[0]);
    }
  }
}

/**
 * Detects the language of an article title
 * @param {String} title
 * @returns {String} language
 **/
function detectLanguage(title) {
  var titleLang = title.match(/^(.+?)([ _]\(([^\(]+)\))?$/)[3];
  var i;
  var len;
  var keys;

  if (!titleLang) {
    return 'english';
  } else {
    keys = Object.keys(languages);
    for (i = 0, len = keys.length; i < len; i++) {
      if (languages[keys[i]] === titleLang) {
        return keys[i];
      }
    }
    return 'english';
  }
}

/**
 * FILESYSTEM UTILITIES
 **/

/**
 * takes in an array of paths and creates those paths if they don't exist
 * @param {Array} arr
 * @returns {Promise}
 **/
function mkDirs(arr) {
  return Promise.each(arr, function makeDirectory(dir) {
    return mkDir(dir);
  }).then(function returnArr() {
    return arr;
  });
}

/**
 * takes a path and returns a promise to create the path if it doesn't exist
 * ignores and continues if the path does exist
 * @param {String} dir
 * @returns {Promise}
 **/
function mkDir(dir) {
  return new Promise(function makePromise(resolve, reject) {
    return fsMkdir(dir).then(function successMkdir() {
      resolve(dir);
    }).catch(function failMkdir(e) {
      if (e.code === 'EEXIST') {
        resolve(dir);
      }
    });
  });
}
