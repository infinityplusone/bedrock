/*
 * Provides init.js as Grunt task
 *
 * Author(s):  Jonathan "Yoni" Knoll
 * Version:    0.1.0
 * Date:       2016-03-02
 *
 */

module.exports = function( grunt ) {
  'use strict';

  var colors = require('colors');

  grunt.registerTask('init', function(appName) {

    if(!appName) {
      grunt.fail.fatal('\n\nYou need to specify a valid application name!\n');
    }

    grunt.file.expand([
      'bower.json',
      'package.json'
    ]).forEach(function(f) {
      var json = grunt.file.readJSON(f);
      json.name = appName;
      json.description = appName;
      json.repository.url = json.repository.url.replace(/bedrock/g, appName);
      if(typeof json.homepage!=='undefined') {
        json.homepage = json.homepage.replace(/bedrock/g, appName);
      }
      grunt.file.write(f, JSON.stringify(json, null, 2));
    });

  });

};
