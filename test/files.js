/* eslint-env mocha */
/* eslint func-names:0 no-unused-expressions:0 */
'use strict';

var expect = require('chai').expect;
var files = require('../lib/files');

var Promise = require('bluebird');
var fsUnlink = Promise.promisify(require('fs').unlink);
var fsStat = Promise.promisify(require('fs').stat);
var fsReadFile = Promise.promisify(require('fs').readFile);
var fsRmdir = Promise.promisify(require('fs').rmdir);

var path = require('path');

describe('files.js', function() {
  describe('high level functionality', function() {
    it('has a save method', function() {
      expect(files.save).to.be.a('function');
    });
  });

  describe('files.save', function() {
    describe('saving files in default directory', function() {
      var dest = './' + path.join('content', '_content', 'test title.md');
      var article = { md: 'some content', title: 'test title' };

      var savedArt;

      before(function(done) {
        return Promise.resolve(files.save(article)).then(function(saved) {
          savedArt = saved;
          done();
        });
      });

      it('saves files in the right directory', function(done) {
        fsStat(dest).then(function(stats) {
          expect(stats.isFile()).to.be.true;
          done();
        });
      });

      it('saves the content correctly', function(done) {
        fsReadFile(dest, 'utf8').then(function(content) {
          expect(content).to.equal('some content');
          done();
        });
      });

      it('returns an article object ready for making links', function(done) {
        expect(savedArt).to.be.an('object');
        expect(savedArt.title).to.equal('test title');
        expect(savedArt.path).to.equal(dest);
        done();
      });

      after(function(done) {
        fsUnlink(dest).then(function() {
          done();
        });
      });
    });

    describe('saving files in custom directory', function() {
      var dest = path.join(process.cwd(), '_content');
      var destFile = path.join(dest, 'test.md');
      var article = { md: 'some content', title: 'test' };

      before(function(done) {
        return Promise.resolve(files.save(article, process.cwd())).then(function(obj) {
          done();
        });
      });

      it('makes a dir if it doesn\'t exist', function(done) {
        fsStat(dest).then(function(stats) {
          expect(stats.isDirectory()).to.be.true;
          done();
        });
      });

      it('saves files in the right directory', function(done) {
        fsStat(destFile).then(function(stats) {
          expect(stats.isFile()).to.be.true;
          done();
        });
      });

      it('saves the content correctly', function(done) {
        fsReadFile(destFile, 'utf8').then(function(content) {
          expect(content).to.equal('some content');
          done();
        });
      });

      after(function(done) {
        fsUnlink(destFile).then(function() {
          fsRmdir(dest).then(function() {
            done();
          });
        });
      });
    });
  });
});
