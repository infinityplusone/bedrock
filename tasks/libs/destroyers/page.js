/*
 * Provides destroy:page to destroy Grunt Task
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

  var name = grunt.option('name');

  var files = grunt.file.expand([paths.app + '/' + name + '/**']);

  files.reverse(); // so the directory is last

  console.log('\nDestroying page: ' + colors.cyan.bold(helpers.checkName({
    name: name,
    scaffold: 'page'
  })) + '\n');

  files.forEach(function(f) {
    helpers.deleteFile(helpers.getPath(f));
  });

};
