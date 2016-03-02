/*
 * Provides generate:component to generate Grunt Task
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

  var f, files, dest;
  var title = helpers.checkName({
    name: grunt.option('name'),
    scaffold: 'page',
    duplicates: true
  });

  var name = helpers.hyphenize(title);
  var hasData = this.flags['with-data'] || this.flags['with-data'] || this.flags['data'];

  // This is the data that will ultimately get converted into the component's pattern.json
  var pageData = {
    title: title,
    name: name,
    safeName: helpers.camelCase(name),
    meta: {
      author: helpers.getGitName(),
      description: [
        grunt.option('description') ? grunt.option('description') : 'Please provide a description for your page.'
      ],
      displayName: title,
      created_at: grunt.template.today('yyyy-mm-dd')
    },
    files: {
      less: name + '.less'
    }
  };

  // these two files will always get generated
  files = {
    html: {
      src: paths.templates.page.html,
      dest: helpers.getPath(paths.app + '/<%=filename%>/index.html')
    },
    less: {
      src: paths.templates.page.less,
      dest: helpers.getPath(paths.app + '/<%=filename%>/<%=filename%>.less')
    }
  };

  files['hbs'] = {
    src: paths.templates.page.hbs,
    dest: helpers.getPath(paths.app + '/<%=filename%>/<%=filename%>.hbs')
  };

  if(hasData) {
    // add a template file & add it to the page data
    files['json'] = {
      src: paths.templates.page.json,
      dest: helpers.getPath(paths.app + '/<%=filename%>/<%=filename%>.json')
    };
  }

  // add a script file & add it to the page data
  files['js'] = {
    src: paths.templates.page.js,
    dest: helpers.getPath(paths.app + '/<%=filename%>/<%=filename%>.js')
  };


  // create the component's folder
  grunt.file.mkdir(helpers.getPath(paths.app + '/<%=filename%>'));

  // generate the files
  helpers.generateFiles({
    scaffold: 'page',
    files: files,
    data: pageData,
    isForced: grunt.option('force')
  });

};
