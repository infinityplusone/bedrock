/*
 * Provides generate:pile to generate Grunt Task
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

  var dest = paths.common + '/manager/pile.json';

  var pileList = grunt.file.expand([
      paths.common + '/**/*.js',
      '!' + paths.common + '/{config.js,{bedrock,manager,stone}/**}'
    ]).map(function(stone) {
      return stone.split('/').slice(2, 3)[0];
    });

  grunt.file.write(dest, JSON.stringify(pileList, null, 2));
  console.log('File ' + colors.cyan(dest) + ' created.');
};
