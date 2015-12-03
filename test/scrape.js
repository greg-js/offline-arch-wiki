/* eslint-env mocha */
/* eslint func-names:0 no-unused-expressions:0 */
'use strict';

var expect = require('chai').expect;
var scrape = require('../lib/scrape');

var request = require('request-promise');
var mock = require('../lib/util').mockRequest;
var mockery = require('mockery');
var mockeryConfig = {
  warnOnReplace: false,
  warnOnUnregistered: false,
  useCleanCache: true,
};

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
    var mockArtObj = {
      url: 'some-url.com/article_title',
    };

    before(function(done) {
      var mockRes = mock('<html><body><h1 id="firstHeading">Article Title</h1><p>This should be ignored</p><div id="content">This should get <strong>picked up</strong>.</div><p>This should be ignored</p></body></html>');
      mockery.enable(mockeryConfig);
      mockery.registerAllowable('../lib/scrape', true);
      mockery.registerMock('request-promise', mockRes);
      done();
    });

    it('gets the article\'s title', function(done) {
      scrape.article(mockArtObj).then(function(article) {
        expect(article.title).to.equal('Article Title');
        done();
      });
    });

    it('converts the article\'s relevant html to markdown', function(done) {
      scrape.article(mockArtObj).then(function(article) {
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
    var mockDoneList = [{title: 'some title'}, {title: 'another existing title'}];

    before(function(done) {
      var mockRes = mock('<html><body><h1 id="firstHeading">Category:A Title</h1><p>This should be ignored</p><div id="mw-subcategories">More to ignore.<ul><li><a href="/index.php/Category:testing" title="first cat title">first cat title</a></li><li><a href="/index.php/Category:another_test" title="another test">second cat title</a></li></ul></div><div id="mw-pages">This should get <strong>ignored</strong>.<ul><li><a href="/test-one.html" title="One link">One link</a></li><li><a href="/test-two.html" title="Link two">Link two</a></li><li><a href="/test-three.html" title="another existing title">Link three</a></li>"</ul></div><p>This should be ignored</p></body></html>');
      mockery.enable(mockeryConfig);
      mockery.registerAllowable('../lib/scrape', true);
      mockery.registerMock('request-promise', mockRes);
      done();
    });

    it('processes the urls in the category page', function(done) {
      scrape.category('some-url.com/Category:something', mockDoneList).then(function(res) {
        expect(res).to.be.an('object');
        done();
      });
    });

    it('saves the article urls', function(done) {
      scrape.category('some-url.com/Category:something', mockDoneList).then(function(res) {
        expect(res.articles).to.be.an('array');
        expect(res.articles[1].url).to.equal('https://wiki.archlinux.org/test-two.html');
        done();
      });
    });

    it('skips articles that appear in the doneList', function(done) {
      scrape.category('some-url.com/Category:something', mockDoneList).then(function(res) {
        expect(res.articles.length).to.equal(2);
        done();
      });
    });

    it('also saves the url of the category page for processing as article later', function(done) {
      scrape.category('some-url.com/Category:something', mockDoneList).then(function(res) {
        expect(res.url).to.equal('some-url.com/Category:something');
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
      var mockRes = mock('<html><body><p>This should be ignored</p> <div id="mw-content-text">This should get <strong>ignored</strong>.  <dd><small>1.1.</small> <a href="/index.php/Category:Test One" title="A test">A test</a><small>(also in <a href="/index.php/Category:Ignore this" title="Ignore this">Ignore this</a>)</small></dd> <dd><small>1.3.</small><a href="/index.php/Category:Test Two" title="Test">Test</a></dd> </div><p>This should be ignored</p></body></html>');
      mockery.enable(mockeryConfig);
      mockery.registerAllowable('../lib/scrape', true);
      mockery.registerMock('request-promise', mockRes);
      done();
    });

    it('saves the category urls from the TOC', function(done) {
      scrape.toc('/Table_of_contents').then(function(urls) {
        expect(urls).to.be.an('array');
        expect(urls[0]).to.equal('https://wiki.archlinux.org/index.php/Category:Test One');
        expect(urls[1]).to.equal('https://wiki.archlinux.org/index.php/Category:Test Two');
        done();
      });
    });

    it('filters out duplicate urls', function(done) {
      scrape.toc('/Table_of_contents').then(function(urls) {
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
