/* eslint-env mocha */
/* eslint func-names:0 no-unused-expressions:0 */
'use strict';

var expect = require('chai').expect;
var oaw = require('../index');

describe('index.js', function() {

  it('has a util object', function() {
    expect(oaw.util).to.be.an('object');
  });

  it('has a processTOC method', function() {
    expect(oaw.processTOC).to.be.a('function');
  });

  it('has a scrape method', function() {
    expect(oaw.scrape).to.be.an('object');
  });

  it('has a save method', function() {
    expect(oaw.save).to.be.a('function');
  });
});
