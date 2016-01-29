/* eslint-env mocha */
/* eslint func-names:0 no-unused-expressions:0 */
'use strict';

var expect = require('chai').expect;
var toMD = require('../lib/to-md');

describe('toMD', function() {
  it('converts simple html into valid markdown', function() {
    expect(toMD('<p>Hello <strong>World</strong>.</p>')).to.equal('Hello **World**.');
  });

  it('converts spans correctly', function() {
    expect(toMD('Hello <span id="test">World</span>.')).to.equal('Hello World.');
  });

  it('converts divs correctly', function() {
    expect(toMD('Testing<div class="test">Hello World.</div>Testing')).to.equal('Testing\n\nHello World.\n\nTesting');
  });

  it('converts inline code snippets correctly', function() {
    expect(toMD('Hello <pre>World</pre>.')).to.equal('Hello `World` .');
  });

  it('converts multiline code blocks correctly', function() {
    expect(toMD('Testing<pre>Hello \nWorld\n!</pre>Testing')).to.equal('Testing\n\n```\nHello \nWorld\n!\n```\n\nTesting');
  });

  it('gets rid of siteSub, jump-to-nav and catlinks divs', function() {
    expect(toMD('<div id="siteSub">Foo</div><div id="jump-to-nav">bar</div><div id="catlinks">baz</div>')).to.equal('');
  });

});
