'use strict';

var Logme = require('logme').Logme;

exports.log = new Logme({ level: 'debug' });

/**
 * TEST UTILITIES
 **/

exports.mockRequest = function returnMockPromise(response) {
  return function makePromise() {
    return new Promise(function promiseFn(resolve, reject) {
      resolve(response);
      reject('mock request failed');
    });
  };
};

