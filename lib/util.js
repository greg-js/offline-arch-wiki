'use strict';

var Logme = require('logme').Logme;

exports.log = new Logme({ level: 'debug' });

/**
 * DATE UTILITIES
 **/

/**
 * Converts a JS date object to a string compatible with arch wiki date
 * @param {Object} moment - Date object
 * @returns {String} archDate - YearMoDaHoMiSe
 **/
exports.toArchDate = function convert(moment) {
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
};

/**
 * Sets the time for a given JS date object to 00:00:00
 * @param {Object} moment - Date object
 * @returns {Object} moment - new date object with time set to 00:00:00
 **/
exports.setMidnight = function set(moment) {
  moment.setHours(0);
  moment.setMinutes(0);
  moment.setSeconds(0);
  return moment;
};

/**
 * Sets the time for a given JS date object to exactly one day earlier
 * @param {Object} moment - Date object
 * @returns {Object} moment - new date object with time set to a day earlier
 **/
exports.setDayEarlier = function set(moment) {
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
};

/**
 * TEST UTILITIES
 **/

/**
 * Mocks a request by returning a promise to resolve a given (string) response
 * @param {String} response - the desired response
 * @returns {Promise} responsePromise - response wrapped in a promise, ready to be mocked
 **/
exports.mockRequest = function returnMockPromise(response) {
  return function makePromise() {
    return new Promise(function promiseFn(resolve, reject) {
      resolve(response);
      reject('mock request failed');
    });
  };
};

/**
 * MISC UTILITIES
 **/

exports.isGoodArticle = function isArticleNormalEnglish(article) {
  var undesiredREArray = [
    'العربية',
    'Български',
    'Čeština',
    'Dansk',
    'Deutsch',
    'Ελληνικά',
    'Español',
    'فارسی',
    'Suomi',
    'Français',
    'עברית',
    'Hrvatski',
    'Magyar',
    'Bahasa',
    'Italiano',
    '日本語',
    '한국어',
    'Lietuvių',
    'Nederlands',
    'Polski',
    'Português',
    'Română',
    'Русский',
    'Slovenčina',
    'Српски',
    'srpski',
    'Svenska',
    'ไทย',
    'Türkçe',
    'Українська',
    '中文',
    'Special:'
  ].map(function(lang) {
    return new RegExp(lang, 'i');
  });

  return undesiredREArray.every(function(re) {
    return !re.test(article.title);
  });
};
