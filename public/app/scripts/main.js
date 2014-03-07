'use strict';

require.config({

  paths: {
    jquery: '../vendor/jquery/dist/jquery',
    underscore: '../vendor/underscore/underscore',
    backbone: '../vendor/backbone/backbone',
    handlebars: '../vendor/handlebars/handlebars',
    text: '../vendor/requirejs-text/text',
    sprintf: '../vendor/sprintf/src/sprintf',
    moment: '../vendor/momentjs/moment',
    jquerymobile: '../lib/jquery.mobile/jquery.mobile.custom',
    cartodb: '../vendor/cartodb.js/dist/cartodb.full.uncompressed'
  },

  shim: {
    jquery: {
      exports: '$'
    },
    jquerymobile: {
      deps: ['jquery'],
      exports: '$'
    },
    underscore: {
      exports: '_'
    },
    backbone: {
      deps: ['jquerymobile', 'underscore'],
      exports: 'Backbone'
    },
    handlebars: {
      exports: 'Handlebars'
    },
    sprintf: {
      exports: 'sprintf'
    },
    cartodb: {
      exports: 'cartodb'
    }
  }

});

require(['router'], function(Router) {

  new Router();

});
