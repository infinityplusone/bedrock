/* -----------------------------------
 *
 * Name: <%= name %>/<%= name %>.js
 * Description: <%= meta.description %>
 * Author(s): <%= meta.author %>
 * Dependencies: bedrock, manager

 * Version: 0.1.0
 * Last Modified: <%= meta.created_at %>
 *
 * Notes: 
 *
 */

define(['../../common/config'], function(require) {

  requirejs([
    'manager',
    'text!app/<%= name %>/<%= name %>.hbs',
    'bedrock'
  ], function(Manager, tmpl) {

    bedrock.handlebars.addTemplates(tmpl);

    var $body = $('body');

    var PageManager = Manager.create({
      name: '<%= title %> Page',

      onManagerReady: function() {
        var mgr = this;

        mgr._super('onManagerReady');

        /* =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= */
        /* =-=-=-=-=-= Add Your JS Here  =-=-=-=-=-= */
        

        /* =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= */

      } // onManagerReady

    }); // (Page)Manager

    bedrock.log(PageManager.name, 'info');

    PageManager.init({
      // ...
    }); // PageManager.config


  }); // requirejs

}); // define
