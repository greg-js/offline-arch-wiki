/* eslint key-spacing:0 */

'use strict';

var Logme = require('logme').Logme;

exports.log = new Logme({ level: 'debug' });
exports.makeDescription = makeDescription;
exports.toArchDate = toArchDate;
exports.getDateFromLastmod = getDateFromLastmod;
exports.setMidnight = setMidnight;
exports.setDayEarlier = setDayEarlier;
exports.mockRequest = mockRequest;
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
 * Takes in an array of article objects and returns an object containing language-specific
 * article object arrays
 * @param {Array} articleObjectList
 * @returns {Object} splitObjectList
 **/
function splitLanguages(articleObjectList) {
  var splitObjectList = {};

  articleObjectList.forEach(function splitArray(articleObject) {
    var lang = detectLanguage(articleObject.title);
    if (!splitObjectList.hasOwnProperty(lang)) {
      splitObjectList[lang] = [];
    }
    splitObjectList[lang].push(articleObject);
  });

  return splitObjectList;
}

/**
 * Takes article content and returns a description (first paragraph if possible)
 * @param {String} content
 * @return {String} descriptiong
 **/
function makeDescription(content) {
  var splitContent = content.split('\n');
  var firstParagraph;
  var firstWord;
  var splitFirstWord;

  // just in case there's only one paragraph?!
  if (splitContent.length === 1) { return splitContent[0]; }

  // ignore the first word if it's empty or if it starts with '[' (it means it's the category or a language link)
  if (!splitContent[0][0] || splitContent[0][0] === '[') {
    return makeDescription(splitContent.slice(1).join('\n'));

  // if the first word starts with '{', get ready for some special cases
  } else if (splitContent[0][0] === '{') {
    firstParagraph = splitContent[0];
    firstWord = firstParagraph.split(/[ \|]/)[0];

    // in some cases it starts with {{Related or {{Note or {{Lowercase, ignore these and skip to next paragraph
    if (/Lowercase|Related|Note|Tip/i.test(firstWord)) {
      return makeDescription(splitContent.slice(1).join('\n'));
    }

    // firstWord can't be split on | in this case so redefine it!!
    firstWord = firstParagraph.split(' ')[0];
    // mental note for future me: this is for splitting {{AUR|something}} kind of constructs - [2] is the only interesting part
    splitFirstWord = firstWord.match(/^\{+(.*)\|(.*?)\}*$/);

    // if it's any kind of link or code, clean up the first word and return it along with the rest of the first paragraph and
    if (/pkg|AUR|ic|hc/i.test(splitFirstWord[1])) {
      return [splitFirstWord[2], firstParagraph.split(' ').slice(1).join(' ')].join(' ').replace(/\{\{.*\|(.*?)\}\}/, '$1');
    }

    // if first character is { but none of these rules apply, just fall through to the second paragraph
    return makeDescription(splitContent.slice(1).join('\n'));
  } else {

    // if none of the special cases apply, the first paragraph is the description
    return splitContent[0];
  }
}

/**
 * Detects the language of an article title
 * @param {String} title
 * @returns {String} language
 **/
function detectLanguage(title) {
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
