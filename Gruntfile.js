
module.exports = function(grunt) {

  var packageJson = grunt.file.readJSON('./package.json');

  // Project configuration
  grunt.initConfig({
    pkg: packageJson,
    meta: {
      dir: {
        app: './app',
        assets: './assets',
        bedrock: './common/bedrock',
        components: './common',
        common: './common',
        templates: {
          gravel: 'tasks/templates/gravel.js',
          pile: 'tasks/templates/pile.js',
          stone: {
            hbs:        'tasks/templates/stone/stone.hbs',
            js:         'tasks/templates/stone/stone.js',
            less:       'tasks/templates/stone/stone.less'
          },
          page: {
            hbs:        'tasks/templates/page/page.hbs',
            html:       'tasks/templates/page/page.html',
            js:         'tasks/templates/page/page.js',
            json:       'tasks/templates/page/page.json',
            less:       'tasks/templates/page/page.less'
          }
        }
      }
    }, // meta

    // The Clean task will delete previous build dir
    clean: {
      assets: [
        "<%=meta.dir.assets%>/"
      ],
      bower: [
        "./bower_components/"
      ]
    }, // clean

    copy: {
      options: {
        verbose: true
      },
      fonts: {
        files: [{
          expand: true,
          flatten: true,
          filter: 'isFile',
          cwd: '<%=meta.dir.components%>',
          src: [
            '**/fonts/*.*',
            '**/fonts/**/*.*',
            '!*.less',
            '!README.md',
            '!**/docs/**'
          ],
          dest: '<%=meta.dir.assets%>/fonts'
        }]
      },
      docImages: {
        files: [{
          expand: true,
          filter: 'isFile',
          cwd: '<%=meta.dir.components%>',
          src: [
            '**/*.bmp',
            '**/*.gif',
            '**/*.jpg',
            '**/*.png',
            '**/*.svg',
            '!**/fonts/**'
          ],
          dest: '<%=meta.dir.assets%>/'
        }]
      },
      images: {
        files: [{
          expand: true,
          flatten: true,
          filter: 'isFile',
          cwd: '<%=meta.dir.components%>',
          src: [
            '**/*.bmp',
            '**/*.gif',
            '**/*.jpg',
            '**/*.png',
            '**/*.svg',
            '!**/docs/**',
            '!**/fonts/**'
          ],
          dest: '<%=meta.dir.assets%>/images'
        }]
      },
      app: {
        files: [{
          expand: true,
          flatten: true,
          filter: 'isFile',
          cwd: '<%=meta.dir.app%>',
          src: [
            '**/*.bmp',
            '**/*.gif',
            '**/*.jpg',
            '**/*.png',
            '**/*.svg'
          ],
          dest: '<%=meta.dir.assets%>/images'
        }]
      }

    }, // copy

    less: {
      options: {
        paths: ['./bower_components', './common'],
        modifyVars: {
          'fontPath': "'./fonts/'",
          'accentFontPath': "''",
          'iconFontPath': "''",
          'blockIconFontPath': "''",
          'outlineIconFontPath': "''",
          'imagePath': "'./images'"
        },
        plugins: [
          new (require('less-plugin-autoprefix'))({browsers: ["last 5 versions"]})
        ],
        compress: false,
        livereload: true,
        spawn: false
      },
      default: {
        expand: true,
        flatten: true,
        src: [
          '<%=meta.dir.app%>/**/*.less',
          '!<%=meta.dir.app%>/**/_*.less'
        ],
        dest: '<%=meta.dir.assets%>',
        ext: '.css'
      } // inLess
    }, // less

    // watch to run some of the above automatically on file changes
    watch: {
      options: {
        livereload: 1337,
        nospawn: true,
        spawn: false
      },
      less: {
        files: [
          '<%=meta.dir.app%>/*/*.less',
          '<%=meta.dir.components%>/**/*.less'
        ],
        tasks: ['less', 'copy:images', 'copy:app']
      } // less

    } // watch
  });

  //LOAD REQUIRED TASKS
  grunt.loadNpmTasks('grunt-contrib-clean');        // https://npmjs.org/package/grunt-contrib-clean
  grunt.loadNpmTasks('grunt-contrib-copy');         // https://npmjs.org/package/grunt-contrib-copy
  grunt.loadNpmTasks('grunt-contrib-less');         // https://npmjs.org/package/grunt-contrib-less
  grunt.loadNpmTasks('grunt-contrib-watch');        // https://npmjs.org/package/grunt-contrib-watch

  grunt.loadTasks('tasks');               // custom tasks for Skeleton

  // for now, just running what we need to get things working
  grunt.registerTask('collect', ['clean:assets', 'generate:pile', 'copy', 'less']);

  grunt.registerTask('refresh', ['clean:bower']);

  // Register Default task(s).
  grunt.registerTask('default', ['collect', 'watch']);

  console.log('\n');
};
