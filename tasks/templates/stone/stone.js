/*
 * Name: <%= name %>.js
 * Description: <%= meta.description %>
 * Dependencies: bedrock, <%= parent %>
 * 
 * Author(s): <%= meta.author %>
 * Version:   0.1.0
 * Date:      <%= meta.last_modified %>
 *
 * Notes: 
 *
 *
 */
define([
  'common/<%= parent %>/<%= parent %>',
  'text!./<%= name %>.hbs',
  'bedrock'
], function(Stone, tmpl) {

  bedrock.handlebars.addTemplates(tmpl);

  return Stone.create({
    meta: {
      author: '<%= meta.author %>',
      description: '<%= meta.description %>',
      displayType: '<%= title %>',
      tags: []
    }, // meta
    data: {},
    source: {},
    templates: {
      content: 'stone-<%= name %>'
    },
    type: '<%= name %>'
  }); // <%= title %>

}); // define
