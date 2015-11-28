/* eslint-env mocha */
/* eslint func-names:0 no-unused-expressions:0 */
'use strict';

var expect = require('chai').expect;
var scrapeArticle = require('../lib/scrape').article;
var scrapeCategory = require('../lib/scrape').category;

var request = require('request-promise');
var mockery = require('mockery');

var promisify = require('bluebird').promisify;

describe('scrape.js', function() {
  describe('high level functionality', function() {
    it('has article as a callable function', function() {
      expect(scrapeArticle).to.be.a('function');
    });

    it('has category as a callable function', function() {
      expect(scrapeCategory).to.be.a('function');
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
      scrapeArticle('some-url.com/article_title').then(function(article) {
        expect(article.title).to.equal('article_title');
        done();
      });
    });

    it('converts the article\'s relevant html to markdown', function(done) {
      scrapeArticle('some-url.com/article_title').then(function(article) {
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
          resolve('<html><body><p>This should be ignored</p><div class="mw-category">This should get <strong>ignored</strong>.<ul><li><a href="/test-one.html"></li><li><a href="/test-two.html"></li></ul></div><p>This should be ignored</p></body></html>');
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
      scrapeCategory('some-url.com/Category:something').then(function(res) {
        expect(res).to.be.an('object');
        done();
      });
    });

    it('saves the title of the category page', function(done) {
      scrapeCategory('some-url.com/Category:something').then(function(res) {
        done();
      });
    });

    it('correctly saves the article urls', function(done) {
      scrapeCategory('some-url.com/Category:something').then(function(res) {
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
});
