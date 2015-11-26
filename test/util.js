/* eslint-env mocha */
/* eslint func-names:0 no-unused-expressions:0 */
'use strict';

var expect = require('chai').expect;
var util = require('../lib/util');

describe('util.js', function() {
  describe('high level methods', function() {
    it('has a toMD method', function() {
      expect(util.toMD).to.be.a('function');
    });

    it('has a processTOC method', function() {
      expect(util.mkDir).to.be.a('function');
    });

    it('has a scrape method', function() {
      expect(util.mkLink).to.be.a('function');
    });
  });

  describe('toMD', function() {
    it('converts simple html into valid markdown', function() {
      expect(util.toMD('<p>Hello <strong>World</strong>.</p>')).to.equal('Hello **World**.');
    });

    it('converts spans correctly', function() {
      expect(util.toMD('Hello <span id="test">World</span>.')).to.equal('Hello World.');
    });

    it('converts divs correctly', function() {
      expect(util.toMD('Testing<div class="test">Hello World.</div>Testing')).to.equal('Testing\n\nHello World.\n\nTesting');
    });

    it('converts inline code snippets correctly', function() {
      expect(util.toMD('Hello <pre>World</pre>.')).to.equal('Hello `World` .');
    });

    it('converts multiline code blocks correctly', function() {
      expect(util.toMD('Testing<pre>Hello \nWorld\n!</pre>Testing')).to.equal('Testing\n\n```\nHello \nWorld\n!\n```\n\nTesting');
    });
  });
});
