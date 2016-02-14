'use strict';

var toMarkdown = require('to-markdown');

/**
 * Converts html to markdown (with custom converters)
 * @param {String} html
 * @returns {String} markdown
 */
module.exports = function htmlToMD(html) {

  // gets rid of edit sections in section titles
  var aConverter = {
    filter: function findNodes(node) {
      return node.tagName === 'A' && /Edit section/i.test(node.title);
    },
    replacement: function replaceA() {
      return '';
    },
  };

  // gets rid of the pesky brackets in section titles!!
  var boringSpanConverter = {
    filter: function findNodes(node) {
      return /SPAN/i.test(node.tagName) && /mw-editsection|mw-editsection-bracket/ig.test(node.className);
    },
    replacement: function replaceSpan() {
      return '';
    },
  };

  var boringDivConverter = {
    filter: function findNodes(node) {
      return /DIV/i.test(node.tagName) && ((/siteSub|jump\-to\-nav|catlinks/i.test(node.id) || /noprint/i.test(node.className) || (/right/.test(node.style.float) && /right/.test(node.style.clear))));
    },
    replacement: function replaceDiv() { return ''; },
  };

  // makes sure span html is cleaned from the output
  // does the same for the <a id="top> and <a id="toggleLink"> tags
  var spanConverter = {
    filter: function findNodes(node) {
      return node.tagName === 'SPAN' || ( node.tagName === 'A' && /top|toggleLink/i.test(node.id) );
    },
    replacement: function replaceSpanDiv(innerHTML) {
      return innerHTML;
    },
  };

  // makes sure div html is cleaned from the output (just outputs innerhtml padded with newlines
  var divConverter = {
    filter: ['div'],
    replacement: function replaceDiv(innerHTML) {
      return '\n' + innerHTML + '\n\n';
    },
  };

  var ddConverter = {
    filter: ['dl'],
    replacement: function replaceDl(innerHTML) {
      return '\n' + innerHTML + '\n\n';
    },
  };

  var dlDtConverter = {
    filter: ['dt', 'dd'],
    replacement: function replaceDiv(innerHTML) {
      return '\n\t' + innerHTML + '\n';
    },
  };

  // outputs single line pre tags as `inline tags` and multi-line pre tags as ```code blocks``` padded with newlines
  var preConverter = {
    filter: ['pre'],
    replacement: function replacePre(innerHTML) {
      if (/\n/.test(innerHTML)) {
        return '\n\n```\n' + innerHTML + '\n```\n\n';
      } else {
        return ' `' + innerHTML + '` ';
      }
    },
  };

  var supConverter = {
    filter: ['sup'],
    replacement: function replacePre() {
      return '';
    },
  };

  return toMarkdown(html, { gfm: true, converters: [aConverter, boringSpanConverter, spanConverter, boringDivConverter, divConverter, preConverter, ddConverter, dlDtConverter, supConverter] }).replace(/\n\\?\n\\?\n/g, '\n\n').replace('\[\[?\]\]?', '');
};
