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
      return node.tagName === 'DIV' && (/siteSub|jump\-to\-nav|catlinks/i.test(node.id) || /noprint/i.test(node.className) || (/right/.test(node.style.float) && /right/.test(node.style.clear)) );
    },
    replacement: function replaceDiv() { return ''; },
  };

  // makes sure div html is cleaned from the output (just outputs innerhtml padded with newlines
  var divConverter = {
    filter: ['div'],
    replacement: function replaceDiv(innerHTML) {
      return '\n\n' + innerHTML + '\n\n';
    },
  };

  var ddConverter = {
    filter: ['dl'],
    replacement: function replaceDl(innerHTML) {
      return '\n\n' + innerHTML + '\n\n';
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

  return toMarkdown(html, { gfm: true, converters: [spanConverter, boringDivConverter, divConverter, preConverter, ddConverter, dlDtConverter, supConverter] });
};
