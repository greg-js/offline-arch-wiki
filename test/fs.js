/* eslint-env mocha */
/* eslint func-names:0 no-unused-expressions:0 */
'use strict';

var expect = require('chai').expect;
var fs = require('../lib/fs');

var Promise = require('bluebird');
var fsUnlink = Promise.promisify(require('fs').unlink);
var fsStat = Promise.promisify(require('fs').stat);
var fsReadFile = Promise.promisify(require('fs').readFile);

var path = require('path');

describe('fs.js', function() {
  describe('high level functionality', function() {
    it('has a save method', function() {
      expect(fs.save).to.be.a('function');
    });

    it('has a mkDir method', function() {
      expect(fs.mkDir).to.be.a('function');
    });

    it('has a mkLink method', function() {
      expect(fs.mkLink).to.be.a('function');
    });
  });

  describe('fs.save', function() {
    describe('saving files in default directory', function() {
      var dest = path.join(process.cwd(), 'content', '_content', 'test title.md');
      var article = { md: 'some content', title: 'test title' };

      before(function(done) {
        return Promise.resolve(fs.save(article)).then(function() {
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

      after(function(done) {
        fsUnlink(dest).then(function() {
          done();
        });
      });
    });

    describe('saving files in custom directory', function() {
      var dest = path.join(process.cwd(), 'test.md');
      var article = { md: 'some content', title: 'test' };

      before(function(done) {
        return Promise.resolve(fs.save(article, process.cwd())).then(function() {
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

      after(function(done) {
        fsUnlink(dest).then(function() {
          done();
        });
      });
    });
  });

  describe('fs.mkDir', function() {
    it('makes a new directory', function(done) {
      Promise.resolve(fs.mkDir('./', 'test dir')).then(function() {

      });
    });

  });

  describe('fs.mkLink', function() {

  });

});
