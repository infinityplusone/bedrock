/*
 * Provides helpers for use in generate & destroy Grunt tasks
 *
 * Author(s):  Jonathan "Yoni" Knoll
 * Version:    0.1.0
 * Date:       2016-03-02
 *
 */

module.exports = function(grunt) {
  'use strict';

  var colors = require('colors');

  return {

    camelCase: function(str) { // an incredibly greedy camelCaser
      return str.toLowerCase().replace(/(-|_|\s)+(.)/g, function(match, g1, g2) {
        return g2.toUpperCase();
      }).replace(/(-|_|\s)+$/gim, '');
    }, // camelCase

    checkName: function(args) {
      var existingComponents = [];
      var reservedNames = [
        'app', 'application',
        'base', 'bedrock', 'bower_components',
        'component',
        'docs',
        'gravel',
        'manager',
        'node_modules',
        'page', 'pile',
        'scripts', 'src', 'stone',
        'tasks'
      ].concat(Object.keys(grunt.file.readJSON('bower.json').dependencies)); // external libs

      // look for existing components with the same name
      grunt.file.expand(['common/*']).forEach(function(f) {
        if(grunt.file.isDir(f)) {
          existingComponents.push(f.replace(/common\//, ''));
        }
      });

      existingComponents = existingComponents.concat(reservedNames);

      if(!args.name) {
        console.log('\n');
        grunt.fail.fatal('\nYou must define a ' + args.scaffold + ' using "--name=Foo" or "--name=\'Foo Bar\'"\n');
      }
      args.name = this.hyphenize(args.name);

      if(reservedNames.indexOf(args.name)>=0) {
        console.log('\n');
        grunt.fail.fatal('\nSorry, the name `' + args.name + '` is not allowed\n');
      }
      if(!!args.duplicates && existingComponents.indexOf(args.name)>=0) {
        console.log('\n');
        grunt.fail.warn('\nWait! `' + args.name + '` already exists!\n\n');
      }
      return this.toTitleCase(args.name);
    }, // checkName

    deleteFile: function(src) {
      if(grunt.file.exists(src)) {
        grunt.file.delete(src);
        console.log('File ' + colors.cyan(src) + colors.red(' deleted') + '.');
      }
      else {
        console.log('File ' + colors.cyan(src) + ' ignored (' + colors.yellow('nonexistent file') + ').');
      }
    }, // deleteFile

    generateFiles: function(opts) {
      var f, file;

      console.log(colors.underline('\nGenerating files for ' + opts.scaffold + ': ' + colors.cyan.bold(opts.data.name) + '\n'));

      for(f in opts.files) {
        if(grunt.file.exists(opts.files[f].dest)) {
          if(!opts.isForced) {
            grunt.fail.warn('\n\tIt looks like this ' + colors.cyan(opts.files[f].dest) + colors.yellow(' already exists!\n\n'));
          }
          else {
            console.log(colors.yellow('\tIt looks like ') + colors.cyan(opts.files[f].dest) + colors.yellow(' already exists!'));
          }
        }
      }
      if(opts.isForced) {
        console.log(colors.white.bold('\n Used --force, continuing.\n'));
      }
      for(f in opts.files) {
        file = opts.files[f];
        this.processTemplate(file.src, file.dest, opts.data);
      }
    }, // generateFiles

    getGitName: function() {
      var n = 'mephistopheles';
      if(grunt.file.exists(process.env['HOME'] + '/.gitconfig')) {
        var gg = grunt.file.read(process.env['HOME'] + '/.gitconfig').split('\n');
        for(var i = 0, l; i<gg.length; i++) {
          l = gg[i].split(' = ');
          if(l.length===2 && l[0].indexOf('name')>=0) {
            n = l[1];
            break;
          }
        }
      }
      return n;
    }, // getGitName

    getPile: function(pileJson) {
      var appPath = pileJson ? pileJson.replace('pile.json', '') : paths.common + '/manager';
      pileJson = pileJson ? pileJson : appPath + '/pile.json';
      if(grunt.file.exists(pileJson)) {
        return grunt.file.readJSON(pileJson);
      }
      grunt.fail.fatal('\nUnable to find `pile.json` in ' + colors.yellow.bold(appPath));
    }, // getPile

    getPath: function(tmpl, fn) { // JSK: this is ridiculous and stupid
      fn = fn ? fn : grunt.option('name');
      return grunt.template.process(tmpl, {data: {filename:this.hyphenize(fn)}});
    }, // getPath

    hyphenize: function(str) {
      if(/_/g.test(str)) {
        console.log(colors.yellow('\tYoni doesn\'t like underscores in filenames. Converting to hyphens. Deal with it!'));
      }
      return str.replace(/[ _]+/g, '-').toLowerCase().replace(/[^a-z0-9\-]/gim, '');
    }, // hyphenize

    processTemplate: function(src, dest, data) {
      var result = grunt.file.copy(src, dest, {
        process: function(tmpl) {
          return grunt.template.process(tmpl, {data: data});
        }
      });
      console.log('File ' + colors.cyan(dest) + ' created.');
    }, // processTemplate

    toTitleCase: function(str) {
      return str.replace(/[\W]/g, ' ').replace(/\w\S*/g, function(txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      });
    } // toTitleCase

  };

};
