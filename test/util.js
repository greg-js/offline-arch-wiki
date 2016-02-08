/* eslint-env mocha */
/* eslint func-names:0 no-unused-expressions:0 */
'use strict';

var expect = require('chai').expect;
var util = require('../lib/util');

var Logme = require('logme').Logme;

var Promise = require('bluebird');

describe('util.js', function() {
  describe('methods', function() {
    it('has a log utility', function() {
      expect(util.log).to.be.an.instanceof(Logme);
    });

    it('has a toArchDate method', function() {
      expect(util.toArchDate).to.be.a('function');
    });

    it('has a setMidnight method', function() {
      expect(util.setMidnight).to.be.a('function');
    });

    it('has a setDayEarlier method', function() {
      expect(util.setDayEarlier).to.be.a('function');
    });

    it('has a mockRequest method', function() {
      expect(util.mockRequest).to.be.a('function');
    });

    it('has a getDateFromLastmod method', function() {
      expect(util.getDateFromLastmod).to.be.a('function');
    });

    it('has a detectLanguage method', function() {
      expect(util.detectLanguage).to.be.a('function');
    });

    it('has a makeDescription method', function() {
      expect(util.makeDescription).to.be.a('function');
    });
  });

  describe('toArchDate', function() {
    it('converts JS date objects to the Arch date format', function() {
      expect(util.toArchDate(new Date('December 04, 2015 04:20:00'))).to.equal('20151204042000');
      expect(util.toArchDate(new Date('January 20, 2000 12:04:58'))).to.equal('20000120120458');
      expect(util.toArchDate(new Date('July 18, 2024 19:00:00'))).to.equal('20240718190000');
    });
  });

  describe('toArchDate', function() {
    it('converts a lastmod date string to a JS date object', function() {
      expect(util.getDateFromLastmod('This page was last modified on 2 February 2016, at 16:11.').toString()).to.equal(new Date('February 2, 2016 16:11:00').toString());
      expect(util.getDateFromLastmod('This page was last modified on 15 December 2014, at 20:00.').toString()).to.equal(new Date('December 15, 2014 20:00:00').toString());
      expect(util.getDateFromLastmod('This page was last modified on 14 August 2017, at 06:48.').toString()).to.equal(new Date('August 14, 2017 06:48:00').toString());
    });
  });
  describe('setMidnight', function() {

    it('sets given JS date objects to midnight that day', function() {
      expect(util.setMidnight(new Date('December 04, 2015 04:20:00')).getTime()).to.equal((new Date('December 04, 2015 00:00:00')).getTime());
      expect(util.setMidnight(new Date('January 20, 2000 12:04:58')).getTime()).to.equal((new Date('January 20, 2000 00:00:00')).getTime());
      expect(util.setMidnight(new Date('July 18, 2024 19:00:00')).getTime()).to.equal((new Date('July 18, 2024 00:00:00')).getTime());
    });
  });

  describe('setDayEarlier', function() {
    it('sets given JS date objects to midnight that day', function() {
      expect(util.setDayEarlier(new Date('December 04, 2015 04:20:00')).getTime()).to.equal((new Date('December 03, 2015 04:20:00')).getTime());
      expect(util.setDayEarlier(new Date('January 20, 2000 12:04:58')).getTime()).to.equal((new Date('January 19, 2000 12:04:58')).getTime());
      expect(util.setDayEarlier(new Date('July 01, 2024 19:00:00')).getTime()).to.equal((new Date('June 30, 2024 19:00:00')).getTime());
      expect(util.setDayEarlier(new Date('January 01, 2016 12:00:00')).getTime()).to.equal((new Date('December 31, 2015 12:00:00')).getTime());
    });
  });

  describe('detectLanguage', function() {
    it('returns the language on foreign language', function() {
      expect(util.detectLanguage('The Arch Way (Ελληνικά)')).to.equal('greek');
      expect(util.detectLanguage('The Arch Way (Indonesia)')).to.equal('indonesian');
      expect(util.detectLanguage('The Arch Way (简体中文)')).to.equal('chinesesim');
    });

    it('defaults to english when no language is specified', function() {
      expect(util.detectLanguage('The Arch Way')).to.equal('english');
      expect(util.detectLanguage('The Arch Way (foo bar)')).to.equal('english');
    });
  });

  describe('makeDescription', function() {
    it('returns the first paragraph in normal cases', function() {
      expect(util.makeDescription('Foo bar.\nBam Baz.')).to.equal('Foo bar.');
      expect(util.makeDescription('Foo\nBar\nBam\nBaz')).to.equal('Foo');
    });

    it('skips newlines', function() {
      expect(util.makeDescription('\nFoo\nBar')).to.equal('Foo');
      expect(util.makeDescription('\n\n\n\n\nFoo\n\nBar')).to.equal('Foo');
    });

    it('skips category and language links', function() {
      expect(util.makeDescription('[[Category:Foo]]\nBar\nBaz')).to.equal('Bar');
      expect(util.makeDescription('[[fr:Baz]]\n[[Category:Foo]]\n\nFoo\n[[Bar]]\nBaz')).to.equal('Foo');
    });

    it('skips related articles and Note paragraphs', function() {
      expect(util.makeDescription('{{Related articles}}\n{{Related|Foo}}\nFoo bar\nbar baz bam')).to.equal('Foo bar');
      expect(util.makeDescription('[[Category:Foo]]\n{{Note|Bar}}\nBaz\nbam')).to.equal('Baz');
    });

    it('returns paragraphs while cleaning up AUR, Pkg and other links', function() {
      expect(util.makeDescription('[[Category:Foo]]\n{{AUR|Foo}} bar\nbaz bam')).to.equal('Foo bar');
      expect(util.makeDescription('\n\n{{Pkg|foo}} {{ic|bar}}\nbam')).to.equal('foo bar');
    });

    it('defaults to everything if there is only one paragraph (left)', function() {
      expect(util.makeDescription('Foo')).to.equal('Foo');
      expect(util.makeDescription('\n\n\n\n\nfoo')).to.equal('foo');
    });
  });
});
