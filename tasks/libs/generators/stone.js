/*
 * Provides generate:stone to generate Grunt Task
 *
 * Author(s):  Jonathan "Yoni" Knoll
 * Version:    0.1.0
 * Date:       2016-03-02
 *
 */

module.exports = function(grunt) {
  'use strict';

  // libs & reference
  var colors = require('colors');
  var helpers = require('../common/helpers')(grunt);
  var paths = grunt.config('meta').dir;

  // defaults
  var defaultLess = '@import (reference) "../bedrock/less/bedrock.less";';

  // stuff used here
  var f, files, dest;
  var title = helpers.checkName({
    name: grunt.option('name'),
    scaffold: 'stone',
    duplicates: true
  });

  var name = helpers.hyphenize(title);
  var parent = grunt.option('parent') ? grunt.option('parent') : 'stone';


  // This is the data that will ultimately get converted into the stone's pattern.json
  var stoneData = {
    title: title,
    name: name,
    safeName: helpers.camelCase(name),
    meta: {
      author: helpers.getGitName(),
      description: [
        grunt.option('description') ? grunt.option('description') : 'Please provide a description for your stone.'
      ],
      displayName: title,
      last_modified: grunt.template.today('yyyy-mm-dd'),
      tags: grunt.option('tags') ? grunt.option('tags').split(',') : [],
      version: "1.0.0"
    },
    importLess: parent ? '@import "../' + parent + '/' + parent + '.less";' : defaultLess,
    parent: parent,
    dependencies: [],
    files: {
      less: name + '.less'
    }
  };

  // these two files will always get generated
  files = {
    less: {
      src: paths.templates.stone.less,
      dest: helpers.getPath(paths.common + '/<%=filename%>/<%=filename%>.less')
    }
  };

  // if there will be a template, add it to the pattern's JSON
    // add a template file & add it to the component data
  files['hbs'] = {
    src: paths.templates.stone.hbs,
    dest: helpers.getPath(paths.common + '/<%=filename%>/<%=filename%>.hbs')
  };
  stoneData.files['hbs'] = [name, 'hbs'].join('.');

  // if there will be a script, add it to the pattern's JSON
  files['js'] = {
    src: paths.templates.stone.js,
    dest: helpers.getPath(paths.common + '/<%=filename%>/<%=filename%>.js')
  };
  stoneData.files['js'] = [name, 'js'].join('.');

  // create the component's folder
  grunt.file.mkdir(helpers.getPath(paths.common + '/<%=filename%>'));

  // generate the files
  helpers.generateFiles({
    scaffold: 'component',
    files: files,
    data: stoneData,
    isForced: grunt.option('force')
  });

};
