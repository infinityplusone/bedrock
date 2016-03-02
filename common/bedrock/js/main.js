/*
 * Name: bedrock.js
 * Description: Bedrock
 * Dependencies: jquery, bedrock/utils, bedrock/handlebars, moment, requirejs, requirejs-text
 * 
 * Author(s): infinityplusone
 * Version:    0.1.0
 * Date:       2016-03-02
 *
 * Notes: helpful handlebars stuff
 *
 *
 */
define('bedrock', [
  'jquery',
  'bedrock/utils',
  'bedrock/handlebars',
  'moment',
  'text'
], function($, utils, handlebars, moment) {
  window.bedrock = utils.base.create({
    BASEFONT: 10,
    TRANSITION_END: 'webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend',
    FORMATS: {
      // for date and time format options, see: http://mentjs.com/docs/#/displaying/format/
      DATE: 'MMM D, YYYY',                        // Jan 1, 2015
      DATEFULL: 'dddd, MMMM D, YYYY',             // Thursday, January 1, 2015
      DATELONG: 'MMMM D, YYYY',                   // January 1, 2015
      DATESHORT: 'MMM D YYYY',                    // Jan 1 2015
      TIME: 'h:mma',                              // 4:30pm
      DATETIME: 'MMM D, YYYY h:mma',              // Jan 1, 2015 4:30pm
      DATETIMEFULL: 'dddd, MMMM D, YYYY h:mma',   // Thursday, January 1, 2015 4:30pm
      DATETIMELONG: 'MMMM D, YYYY h:mma',         // January 1, 2015 4:30pm
      DATETIMESHORT: 'MMM D YYYY h:mma',          // Jan 1 2015 4:30pm
      DATETIMEISO: 'YYYY-MM-DDTHH:mm'             // 2015-01-01T16:30 (useful for the datetime attr of the <time> element, for ex)
    }, // FORMATS
    _: {},
    debug: typeof bedrockDebugLevel!=='undefined' ? bedrockDebugLevel : false,
    handlebars: handlebars,
    moment: moment,
    utils: utils,
    templates: {},
    addModule: function(name, module) {
      this.modules[name] = module;
      return module;
    }, // module


    log: function() { this.utils.log.apply(this, arguments); }
  });

  return bedrock;
});