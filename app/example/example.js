/* -----------------------------------
 *
 * Name: example/example.js
 * Description: Please provide a description for your page.
 * Author(s): infinityplusone
 * Dependencies: bedrock, manager

 * Version: 0.1
 * Last Modified: 2016-03-02
 *
 * Notes: 
 *
 */

define(['../../common/config'], function(require) {
  
  bedrockDebugLevel = 1;

  requirejs([
    'manager',
    'text!app/example/example.hbs',
    'bedrock'
  ], function(Manager, tmpl) {

    bedrock.handlebars.addTemplates(tmpl);

    var $body = $('body');

    var PageManager = Manager.create({
      name: 'Example Page',

      onManagerReady: function() {
        var mgr = this;

        mgr._super('onManagerReady');

        /* =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= */
        /* =-=-=-=-=-= Add Your JS Here  =-=-=-=-=-= */

        bedrock.log('Look at that! It loaded!');

        /* =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= */

      } // onManagerReady

    }); // (Page)Manager

    bedrock.log(PageManager.name, 'info');

    PageManager.init({
      // ...
    }); // PageManager.config


  }); // requirejs

}); // define
