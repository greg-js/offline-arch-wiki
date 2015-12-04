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
  });

  describe('toArchDate', function() {
    it('converts JS date objects to the Arch date format', function() {
      expect(util.toArchDate(new Date('December 04, 2015 04:20:00'))).to.equal('20151204042000');
      expect(util.toArchDate(new Date('January 20, 2000 12:04:58'))).to.equal('20000120120458');
      expect(util.toArchDate(new Date('July 18, 2024 19:00:00'))).to.equal('20240718190000');
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
});
