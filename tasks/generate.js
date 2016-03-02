/*
 * Provides generate.js as Grunt task
 *
 * Author(s):  Jonathan "Yoni" Knoll
 * Version:    0.1.0
 * Date:       2016-03-02
 *
 */

module.exports = function( grunt ) {
  'use strict';

  var colors = require('colors');
  var makeGravel = require('./libs/generators/gravel');
  var makePage = require('./libs/generators/page');
  var makePile = require('./libs/generators/pile');
  var makeStone = require('./libs/generators/stone');

  // helper task to generate stones (and some other stuff)
  // Usage: grunt generate:page --name="foo" (can be either the stone name or the file name)
  grunt.registerMultiTask('generate', '', function(x) {

    if(!this.target) {
      grunt.fail.fatal('\nWhat are you making here?\n');
    }

    switch(this.target) {

      case 'gravel':
        makeGravel.call(this, grunt);
        break;

      case 'page':
        makePage.call(this, grunt);
        break;

      case 'pile':
        makePile.call(this, grunt);
        makeGravel.call(this, grunt);
        break;

      case 'stone':
        makeStone.call(this, grunt);
        grunt.task.run('generate:pile');
        break;

      default:
        grunt.fail.fatal('\n\n\tI don\'t know how to generate a ' + colors.cyan.bold(this.target) + colors.red('!\n\n'));
        break;

    }

  }); // generate

  grunt.config('generate', {
    'gravel': {},
    'page': {},
    'pile': {},
    'stone': {}
  });

};
