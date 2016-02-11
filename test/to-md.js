/* eslint-env mocha */
/* eslint func-names:0 no-unused-expressions:0 */
'use strict';

var expect = require('chai').expect;
var toMD = require('../lib/to-md').convert;

describe('toMD', function() {

  it('should convert bold and emphasized text', function() {
    expect(toMD('\'\'\'foo\'\'\'bar')).to.equal('**foo**bar');
    expect(toMD('\'\'foo\'\'bar')).to.equal('*foo*bar');
    expect(toMD('\'\'\'\'\'foo\'\'\'\'\'bar')).to.equal('**_foo_**bar');
    expect(toMD('\'\'italics\'\', \'\'\'bold\'\'\', and \'\'\'\'\'both\'\'\'\'\'')).to.equal('*italics*, **bold**, and **_both_**');
  });

  it('should convert internal links', function() {
    expect(toMD('[[copy edit]]')).to.equal('**copy edit**');
    expect(toMD('[[copy edit]]ors')).to.equal('**copy edit**ors');
  });

  it('should convert piped and hashed links', function() {
    expect(toMD('[[Android (operating system)|Android]]')).to.equal('**Android**');
    expect(toMD('[[Frog#Locomotion]]')).to.equal('**Locomotion**');
    expect(toMD('[[Frog#Locomotion|the movement of frogs]]')).to.equal('**the movement of frogs**');
  });

  it('should convert plain links and named links', function() {
    expect(toMD('http://www.wikipedia.org')).to.equal('*http://www.wikipedia.org*');
    expect(toMD('[http://www.wikipedia.org]')).to.equal('*http://www.wikipedia.org*');
    expect(toMD('[http://www.wikipedia.org wikipedia]')).to.equal('**wikipedia** (*http://www.wikipedia.org*)');
  });

  it('should convert ordered and unordered lists', function() {
    expect(toMD('# foo')).to.equal('1. foo');
    expect(toMD('* foo')).to.equal('+ foo');
    expect(toMD('** foo')).to.equal('  + foo');
    expect(toMD('#* foo')).to.equal('  + foo');
    expect(toMD('*# foo')).to.equal('  1. foo');
    expect(toMD('## foo')).to.equal('  1. foo');
    expect(toMD('##*# foo')).to.equal('      1. foo');
  });

  it('should convert definition lists', function() {
    expect(toMD('; Foo')).to.equal('**Foo**');
    expect(toMD(': bar')).to.equal('\tbar');
    expect(toMD('; Foo: bar')).to.equal('**Foo**\n\tbar');
  });

  it('should convert inline code', function() {
    expect(toMD('{{ic|test}}')).to.equal('`test`');
    expect(toMD('foo bar {{ic|test}} baz {{ic|bam}} bar')).to.equal('foo bar `test` baz `bam` bar');
  });

  it('should convert block code without headers', function() {
    expect(toMD('{{bc|code}}')).to.equal('```\ncode\n```');
  });

  it('should convert block code with headers', function() {
    expect(toMD('{{hc|head|code}}')).to.equal('```\nhead\ncode\n```');
  });

  it('should ignore these edge cases', function() {
    expect(toMD('[foo]')).to.equal('[foo]');
  });

  it('should convert strikethroughs', function() {
    expect(toMD('foo <s>bar</s> baz')).to.equal('foo ~~bar~~ baz');
  });

  it('should convert underlines', function() {
    expect(toMD('foo <u>bar</u> baz')).to.equal('foo _bar_ baz');
  });

  it('should delete comments', function() {
    expect(toMD('<!-- this is a comment -->')).to.equal('');
    expect(toMD('<!-- this is a comment -->foo bar')).to.equal('foo bar');
  });

  it('should convert headers', function() {
    expect(toMD('== header 2 ==')).to.equal('## header 2');
    expect(toMD('===== header 5 =====')).to.equal('##### header 5');
  });

  it('should convert colon-indentation to tabs', function() {
    expect(toMD(':foo')).to.equal('\tfoo');
    expect(toMD('::::foo bar')).to.equal('\t\t\t\tfoo bar');
    expect(toMD('foo ::bar')).to.equal('foo ::bar');
  });

  it('should convert templates', function() {
    expect(toMD('{{AUR|a package}}')).to.equal('**a package** (*AUR*)');
    expect(toMD('{{Tip|foo}}')).to.equal('**Tip**: *foo*');
  });

  it('should convert tables', function() {
    expect(toMD('{| class="wikitable"')).to.equal('');
    expect(toMD('|+ Tabular data')).to.equal('**_Tabular data_**');
    expect(toMD('! Distro !! Color')).to.equal('Distro | Color\n--- | ---');
    expect(toMD('! Distro !! Color !! Foo !! Bar')).to.equal('Distro | Color | Foo | Bar\n--- | --- | --- | ---');
    expect(toMD('| Ubuntu || Orange || Blue')).to.equal('Ubuntu | Orange | Blue');
    expect(toMD('|-')).to.equal('');
    expect(toMD('|}')).to.equal('');
  });
});
