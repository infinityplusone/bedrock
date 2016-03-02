(function() {

  requirejs.config({
    baseUrl: '../../',
    urlArgs: 'bust=' + (new Date()).getTime(),
    paths: {
      // these come from bower
      'bootstrap':            'bower_components/bootstrap/js', // provides a shorthand to get to bootstrap components
      'codemirror':           'bower_components/codemirror',
      'fullcalendar':         'bower_components/fullcalendar/dist/fullcalendar',
      'handlebars':           'bower_components/handlebars/handlebars',
      'jquery':               'bower_components/jquery/dist/jquery',
      'jquery-bindable':      'bower_components/jquery-enable/dist/jquery.bindable',
      'jquery-hotkeys':       'bower_components/jquery.hotkeys/jquery.hotkeys',
      'jquery-konami':        'bower_components/konami-code/src/jquery.konami',
      'moment':               'bower_components/moment/moment',
      'moment-timezone':      'bower_components/moment-timezone/moment-timezone',
      'text':                 'bower_components/requirejs-text/text',
      'typeahead-js':         'bower_components/typeahead.js/dist/typeahead.jquery.min',

      'bedrock':              'common/bedrock/js',
      'manager':              'common/manager',
      'bucket':               'common/manager/bucket',
      'gravel':               'common/manager/gravel',
      'stones':               'common'
    },
    packages: [
      {
        name: 'bedrock',
        main: 'main'
      },
      {
        name: 'manager',
        main: 'main'
      }
    ],
    shim: {
      'bedrock':              { deps: [ 'jquery', 'moment', 'handlebars' ]},
      'manager':              { deps: [ 'jquery', 'bedrock', 'gravel' ]},

      'bootstrap':            { deps: [ 'jquery' ] },
      'bootstrap/popover':    { deps: [ 'jquery', 'bootstrap/tooltip' ] },
      'bootstrap/modal':      { deps: [ 'jquery' ] },
      'fullcalendar':         { deps: [ 'jquery', 'moment' ] },
      'jquery-bindable':      { deps: [ 'jquery' ] },
      'jquery-hotkeys':       { deps: [ 'jquery' ] },
      'jquery-konami':        { deps: [ 'jquery' ] },
      'moment-timezone':      { deps: [ 'moment' ] },
      'typeahead-js': { // Solution found here: https://github.com/twitter/typeahead.js/issues/1211. Dead project, so might be worth using something else
        deps: [ 'jquery' ],
        init: function($) {
          require.s.contexts._.registry['typeahead.js'].factory($);
        }
      }
    },
    config: {
      moment: {
        noGlobal: true
      }
    }
  });

})();
