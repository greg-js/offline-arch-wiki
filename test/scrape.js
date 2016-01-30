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
      var mockRes = mock('<html><body><h1 id="firstHeading">Article Title</h1><p>This should be ignored</p><div id="content"><div id="mw-content-text"><p>From foobar:</p><p>The description.</p><div><p>And this should get <strong>picked up</strong>.</p></div></div></div><p>This should be ignored</p></body></html>');
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
        expect(article.md).to.equal('From foobar:\n\nThe description.\n\nAnd this should get **picked up**.');
        done();
      });
    });

    it('saves the description to the article object', function(done) {
      scrape.article(mockArtObj).then(function(article) {
        expect(article.description).to.equal('The description.');
        done();
      });
    });

    it('saves the url to the article object', function(done) {
      scrape.article(mockArtObj).then(function(article) {
        expect(article.url).to.equal('some-url.com/article_title');
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

  describe('scrape.changes', function() {
    before(function(done) {
      var mockRes = mock('<html><body><div id="mw-content-text"><div class="mw-changeslist"><h4>4 December 2015</h4><div><table class="mw-enhanced-rc mw-changeslist-ns0-SSMTP mw-changeslist-line-not-watched"><tbody><tr><td class="mw-enhanced-rc"><span class="mw-enhancedchanges-arrow-space"></span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;13:58&nbsp;</td><td> <span class="mw-title"><a href="/index.php/Vim_(%D0%A0%D1%83%D1%81%D1%81%D0%BA%D0%B8%D0%B9)" title="Vim (Русский)" class="mw-changeslist-title">Vim (Русский)</a></span>‎‎  <span class="mw-changeslist-separator">. .</span>  <strong dir="ltr" class="mw-plusminus-neg" title="37,097 bytes after change">(-710)</strong>‎ <span class="mw-changeslist-separator">. .</span>  <span class="changedby">[<a href="/index.php/User:MrReDoX" title="User:MrReDoX" class="mw-userlink">MrReDoX</a>‎ (2×)]</span></td><td> <span class="mw-title"><a href="/index.php/TEST1" title="Test 1" class="mw-changeslist-title">TEST 1</a></span>‎  <span class="mw-changeslist-separator">. .</span> <span dir="ltr" class="mw-plusminus-pos" title="5,089 bytes after change">(+425)</span>‎ <span class="mw-changeslist-separator">. .</span>  <a href="/index.php?title=User:Thomastc&amp;action=edit&amp;redlink=1" class="new mw-userlink" title="User:Thomastc (page does not exist)">Thomastc</a> <span class="mw-usertoollinks"></span> <span class="comment">(Point to App Passwords for Gmail)</span></td></tr></tbody></table><table class="mw-enhanced-rc mw-changeslist-ns0-NFS mw-changeslist-line-not-watched"><tbody><tr><td class="mw-enhanced-rc"><span class="mw-enhancedchanges-arrow-space"></span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;18:46&nbsp;</td><td> <span class="mw-title"><a href="/index.php/TEST2" title="Test 2" class="mw-changeslist-title">Test 2</a></span>‎ (<a href="/index.php?title=NFS&amp;curid=15069&amp;diff=410872&amp;oldid=408860" tabindex="5">diff</a> | <a href="/index.php?title=NFS&amp;curid=15069&amp;action=history" title="NFS">hist</a>) <span class="mw-changeslist-separator">. .</span> <span dir="ltr" class="mw-plusminus-pos" title="19,396 bytes after change">(+64)</span>‎ <span class="mw-changeslist-separator">. .</span>  <a href="/index.php?title=User:Aw24&amp;action=edit&amp;redlink=1" class="new mw-userlink" title="User:Aw24 (page does not exist)">Aw24</a> <span class="mw-usertoollinks"></span> <span class="comment">(<a href="/index.php/NFS#NetworkManager_dispatcher" title="NFS">→</a>‎<span dir="auto"><span class="autocomment">NetworkManager dispatcher: </span> add warning on noauto</span>)</span></td></tr></tbody></table></div></div></body></html>');
      mockery.enable(mockeryConfig);
      mockery.registerAllowable('../lib/scrape', true);
      mockery.registerMock('request-promise', mockRes);
      done();
    });

    it('should return an array of article objects containing only English language changes', function(done) {
      scrape.changes('some-url/index.php?changesetc').then(function(changesArray) {
        expect(changesArray).to.be.an('array');
        expect(changesArray.length).to.equal(2);
        expect(changesArray[0].url).to.equal('https://wiki.archlinux.org/index.php/TEST1');
        expect(changesArray[1].url).to.equal('https://wiki.archlinux.org/index.php/TEST2');
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
