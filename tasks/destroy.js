/*
 * Provides destroy.js as Grunt task
 *
 * Author(s):  Jonathan "Yoni" Knoll
 * Version:    0.1.0
 * Date:       2016-03-02
 *
 */

module.exports = function( grunt ) {
  'use strict';

  var colors = require('colors');
  var destroyStone = require('./libs/destroyers/stone');
  var destroyPage = require('./libs/destroyers/page');

  // helper task to destroy generated objects
  // Usage: grunt destroy:page --name="foo" (can be either the page name or the file name)

  grunt.registerMultiTask('destroy', '', function() {

    if(!this.target) {
      grunt.fail.fatal('\nWhat are you trying to destroy?\n');
    }

    switch(this.target) {

      case 'stone':
        destroyStone.call(this, grunt);
        grunt.task.run('generate:pile');
        break;

      case 'page':
        destroyPage.call(this, grunt);
        break;

      default:
        grunt.fail.fatal('\n\n\tI don\'t know how to destroy a `' + colors.cyan.bold(this.target) + '`!\n\n');
        break;

    }

  }); // destroy

  grunt.config('destroy', {
    'gravel': {},
    'page': {},
    'stone': {}
  });

};
