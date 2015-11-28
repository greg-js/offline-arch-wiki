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

  describe('scrape.article', function() {
    before(function(done) {
      var mockRes = function() {
        return new Promise(function(resolve, reject) {
          resolve('<html><body><p>This should be ignored</p><div id="content">This should get <strong>picked up</strong>.</div><p>This should be ignored</p></body></html>');
          reject('error');
        });
      };

      mockery.enable({
        warnOnReplace: false,
        warnOnUnregistered: false,
        useCleanCache: true,
      });

      mockery.registerAllowable('../lib/scrape', true);

      mockery.registerMock('request-promise', mockRes);

      done();
    });

    it('gets the article\'s title', function(done) {
      scrape.article('some-url.com/article_title').then(function(article) {
        expect(article.title).to.equal('article_title');
        done();
      });
    });

    it('converts the article\'s relevant html to markdown', function(done) {
      scrape.article('some-url.com/article_title').then(function(article) {
        expect(article.md).to.equal('This should get **picked up**.');
        done();
      });
    });

    after(function(done) {
      mockery.disable();
      mockery.deregisterAll();
      done();
    });
  });

  describe('scrape.category', function() {
    before(function(done) {
      var mockRes = function() {
        return new Promise(function(resolve, reject) {
          resolve('<html><body><p>This should be ignored</p><div id="mw-pages">This should get <strong>ignored</strong>.<ul><li><a href="/test-one.html">One link</a></li><li><a href="/test-two.html">Link two</a></li></ul></div><p>This should be ignored</p></body></html>');
          reject('error');
        });
      };

      mockery.enable({
        warnOnReplace: false,
        warnOnUnregistered: false,
        useCleanCache: true,
      });

      mockery.registerAllowable('../lib/scrape', true);

      mockery.registerMock('request-promise', mockRes);

      done();
    });

    it('processes the urls in the category page', function(done) {
      scrape.category('some-url.com/Category:something').then(function(res) {
        expect(res).to.be.an('object');
        done();
      });
    });

    it('saves the title of the category page', function(done) {
      scrape.category('some-url.com/Category:something').then(function(res) {
        done();
      });
    });

    it('correctly saves the article urls', function(done) {
      scrape.category('some-url.com/Category:something').then(function(res) {
        expect(res.urls[1]).to.equal('https://wiki.archlinux.org/test-two.html');
        done();
      });
    });

    after(function(done) {
      mockery.disable();
      mockery.deregisterAll();
      done();
    });
  });

  describe('scrape.toc', function() {
    before(function(done) {
      var mockRes = function() {
        return new Promise(function(resolve, reject) {
          resolve('<html><body><p>This should be ignored</p><div id="mw-content-text">This should get <strong>ignored</strong>.<dd><a href="some-url/Category:Test One">A test</a></dd><dd><a href="some-url/Category:Test Two">Test</a></dd><dd><a href="some-url/Category:Test One">A duplicate</a></dd></div><p>This should be ignored</p></body></html>');
          reject('error');
        });
      };

      mockery.enable({
        warnOnReplace: false,
        warnOnUnregistered: false,
        useCleanCache: true,
      });

      mockery.registerAllowable('../lib/scrape', true);

      mockery.registerMock('request-promise', mockRes);

      done();
    });

    it('saves the category urls from the TOC', function(done) {
      scrape.toc('some-url.com/Table_of_contents').then(function(urls) {
        expect(urls).to.be.an('array');
        expect(urls[0]).to.equal('some-url/Category:Test One');
        expect(urls[1]).to.equal('some-url/Category:Test Two');
        done();
      });
    });

    it('filters out duplicate urls', function(done) {
      scrape.toc('some-url.com/Table_of_contents').then(function(urls) {
        expect(urls.length).to.equal(2);
        done();
      });
    });

    after(function(done) {
      mockery.disable();
      mockery.deregisterAll();
      done();
    });
  });
});
