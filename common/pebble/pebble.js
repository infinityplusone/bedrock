/*
 * Name: pebble.js
 * Description: Please provide a description for your stone.
 * Dependencies: bedrock, stone
 * 
 * Author(s): infinityplusone
 * Version:    0.1.0
 * Date:       2016-03-02
 *
 * Notes: 
 *
 *
 */
define([
  'common/stone/stone',
  'text!./pebble.hbs',
  'bedrock'
], function(Stone, tmpl) {

  bedrock.handlebars.addTemplates(tmpl);

  return Stone.create({
    meta: {
      author: 'infinityplusone',
      description: 'Please provide a description for your stone.',
      displayType: 'Pebble',
      tags: []
    }, // meta
    data: {},
    source: {},
    templates: {
      content: 'stone-pebble'
    },
    type: 'pebble'
  }); // Pebble

}); // define
