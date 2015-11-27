/* eslint-env mocha */
/* eslint func-names:0 no-unused-expressions:0 */
'use strict';

var expect = require('chai').expect;
var scrape = require('../lib/scrape');

var request = require('request-promise');
var mockery = require('mockery');

var promisify = require('bluebird').promisify;

describe('scrape.js', function() {
  describe('high level functionality', function() {
    it('has article as a callable function', function() {
      expect(scrape.article).to.be.a('function');
    });

    it('has category as a callable function', function() {
      expect(scrape.category).to.be.a('function');
    });
  });

  /* can't get the damn request-promise mock to work!!!
   */
  // describe('scrape.article', function() {
  //   before(function(done) {
  //     var mockRes = function() {
  //       return Promise.resolve('<html><body><p>This should be ignored</p><div id="content">This should get <strong>picked up</strong>.</div><p>This should be ignored</p></body></html>');
  //     };

  //     mockery.enable({
  //       warnOnReplace: false,
  //       warnOnUnregistered: false,
  //       useCleanCache: true,
  //     });

  //     mockery.registerAllowable('../lib/scrape', true);

  //     mockery.registerMock('request-promise', function() {
  //       return mockRes;
  //     });

  //     done();
  //   });

  //   it('gets the article\'s title', function(done) {
  //     Promise.resolve(scrape.article('some-url.com/article title')).then(function(article) {
  //       expect(article.title).to.equal('article title');
  //       done();
  //     });
  //   });

  //   it('converts the article\'s relevant html to markdown', function(done) {
  //     Promise.resolve(scrape.article('some-url.com/article title')).then(function(article) {
  //       expect(article.md).to.equal('This should get **picked up**.');
  //       done();
  //     });
  //   });

  //   after(function(done) {
  //     mockery.disable();
  //     mockery.deregisterAll();
  //     done();
  //   });
  // });
});
