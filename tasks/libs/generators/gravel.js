/*
 * Provides generate:gravel to generate Grunt Task
 *
 * Author(s):  Jonathan "Yoni" Knoll
 * Version:    0.1.0
 * Date:       2016-03-02
 *
 */

module.exports = function(grunt) {
  'use strict';

  var colors = require('colors');
  var helpers = require('../common/helpers')(grunt);
  var paths = grunt.config('meta').dir;

  var app = grunt.option('application'),
      piles = [],
      gravel, pileData;

  if(grunt.option('all')) {
    piles.push(paths.common + '/**/pile.json');
  }
  else if(app) {
    piles.push(paths.app + app + '/pile.json');
  }
  else {
    piles.push(paths.common + '/manager/pile.json');
  }

  grunt.file.expand(piles).forEach(function(pile) {
    gravel = helpers.getPile(pile);
    gravel.sort();
    pileData = {
        dependencies: JSON.stringify([].concat(gravel.map(function(c) {
              return ['common', c, c].join('/');
            })).concat('bedrock'),
        null, 2),
        pile: JSON.stringify(gravel, null, null),
        pileSource: pile.split('/').slice(-2,-1)[0] // which pile is being generated
    };
    helpers.processTemplate(paths.templates.gravel, pile.replace('pile.json', 'gravel.js'), pileData);
  });

};
