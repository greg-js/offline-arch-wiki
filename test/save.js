/* eslint-env mocha */
/* eslint func-names:0 no-unused-expressions:0 */
'use strict';

var expect = require('chai').expect;
var save = require('../lib/save');

var Promise = require('bluebird');
var fsUnlink = Promise.promisify(require('fs').unlink);
var fsStat = Promise.promisify(require('fs').stat);
var fsReadFile = Promise.promisify(require('fs').readFile);

var path = require('path');

describe('save.js', function() {
  describe('high level functionality', function() {
    it('is a callable function', function() {
      expect(save).to.be.a('function');
    });
  });

  describe('saving files in default directory', function() {
    var dest = path.join(process.cwd(), 'content', '_content', 'test title.md');

    before(function(done) {
      return Promise.resolve(save('some content', 'test title')).then(function() {
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

    before(function(done) {
      return Promise.resolve(save('some content', 'test', process.cwd())).then(function() {
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
