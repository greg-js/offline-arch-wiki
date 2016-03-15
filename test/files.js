/* eslint-env mocha */
/* eslint func-names:0 no-unused-expressions:0 */
'use strict';

var expect = require('chai').expect;
var files = require('../lib/files');

var Promise = require('bluebird');
var mkDirs = require('../lib/util').mkDirs;
var fsUnlink = Promise.promisify(require('fs').unlink);
var fsStat = Promise.promisify(require('fs').stat);
var fsReadFile = Promise.promisify(require('fs').readFile);
var fsRmdir = Promise.promisify(require('fs').rmdir);

var path = require('path');

describe('files.js', function() {
  describe('high level functionality', function() {
    it('should have a saveEverything method', function() {
      expect(files.saveEverything).to.be.a('function');
    });

    it('should have a saveLanguageWiki method', function() {
      expect(files.saveLanguageWiki).to.be.a('function');
    });

    it('should have a writeFile method', function() {
      expect(files.writeFile).to.be.a('function');
    });

    it('should have a storeDb method', function() {
      expect(files.storeDb).to.be.a('function');
    });

    it('should have a updateDb method', function() {
      expect(files.updateDb).to.be.a('function');
    });

    it('should have a loadDb method', function() {
      expect(files.loadDb).to.be.a('function');
    });
  });

  describe('files.writeFile', function() {
    describe('should save an article to a given location', function() {
      var dest = './' + path.join('content', '_content', 'test.md');
      var relativeDest = 'test.md';
      var article = { content: 'some <em>content</em>', title: 'test title', mdPath: dest };

      var savedArt;

      before(function(done) {
        return mkDirs(['./content', './content/_content']).then(function andThen() {
          return Promise.resolve(files.writeFile(article, dest)).then(function(saved) {
            savedArt = saved;
            done();
          });
        });
      });

      it('should save files in the right directory', function(done) {
        fsStat(dest).then(function(stats) {
          expect(stats.isFile()).to.be.true;
          done();
        });
      });

      it('should save the content correctly', function(done) {
        fsReadFile(dest, 'utf8').then(function(content) {
          expect(content).to.equal('some *content*');
          done();
        });
      });

      it('should return an article object ready for making links', function(done) {
        expect(savedArt).to.be.an('object');
        expect(savedArt.title).to.equal('test title');
        expect(savedArt.mdPath).to.equal(relativeDest);
        expect(savedArt.description).to.equal('some content');
        done();
      });

      after(function(done) {
        fsUnlink(dest).then(function() {
          done();
        });
      });
    });

    describe('should save wikitext when passed this option', function() {
      var dest = './' + path.join('content', '_content', 'test.wt');
      var relativeDest = 'test.wt';
      var article = { content: 'some **content**', title: 'test title', wtPath: dest };

      var savedArt;

      before(function(done) {
        return Promise.resolve(files.writeFile(article, dest, true)).then(function(saved) {
          savedArt = saved;
          done();
        });
      });

      it('should save files in the right directory', function(done) {
        fsStat(dest).then(function(stats) {
          expect(stats.isFile()).to.be.true;
          done();
        });
      });

      it('should save the content correctly', function(done) {
        fsReadFile(dest, 'utf8').then(function(content) {
          expect(content).to.equal('some **content**');
          done();
        });
      });

      it('should return an article object', function(done) {
        expect(savedArt).to.be.an('object');
        expect(savedArt.title).to.equal('test title');
        expect(savedArt.wtPath).to.equal(relativeDest);
        expect(savedArt.description).to.equal('some content');
        done();
      });
      after(function(done) {
        fsUnlink(dest).then(function() {
          done();
        });
      });
    });
  });

  describe('files.saveLanguageWiki', function() {
  });
});

