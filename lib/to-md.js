'use strict';

/**
 * Converts html to markdown (with custom converters)
 * @param {String} html
 * @returns {String} markdown
 */
module.exports = function htmlToMD(html) {
  var toMarkdown = require('to-markdown');

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

  var boringDivConverter = {
    filter: function findNodes(node) {
      return node.tagName === 'DIV' && /siteSub|jump\-to\-nav|catlinks|noprint/i.test(node.id);
    },
    replacement: function replaceDiv() { return ''; },
  };

  // makes sure div html is cleaned from the output (just outputs innerhtml padded with newlines
  // does the same for the dl, dt and dd tags that permeate arch wiki content
  var divConverter = {
    filter: ['div', 'dl', 'dt', 'dd'],
    replacement: function replaceDiv(innerHTML) {
      return '\n\n' + innerHTML + '\n\n';
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

  var externalLinkConverter = {
    filter: function findNodes(node) {
      return node.tagName === 'A' && /external/i.test(node.className);
    },
    replacement: function replaceExtLink(innerHTML, node) {
      return '**' + innerHTML + '** (_' + node.href + '_)';
    },
  };

  var internalLinkConverter = {
    filter: ['a'],
    replacement: function replaceIntLink(innerHTML) {
      return '**' + innerHTML + '**';
    },
  };

  return toMarkdown(html, { gfm: true, converters: [spanConverter, boringDivConverter, divConverter, preConverter, externalLinkConverter, internalLinkConverter] });
};
