'use strict';

exports.toMD = function htmlToMD(html) {
  var toMarkdown = require('to-markdown');

  // makes sure span html is cleaned from the output
  // does the same for the <a id="top> and <a id="toggleLink"> tags
  var spanConverter = {
    filter: function findNodes(node) {
      return node.tagName === 'SPAN' ||
             (node.tagName === 'A' && ( node.id === 'top' || node.id === 'toggleLink'));
    },
    replacement: function replaceSpanDiv(innerHTML) {
      return innerHTML;
    },
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

  return toMarkdown(html, { converters: [spanConverter, divConverter, preConverter] });

};

exports.mkDir = function makeDirectory(loc, title) {

};

exports.mkLink = function makeLink(src, dest) {

};
