'use strict';

require.config({

  paths: {
    jquery: '../vendor/jquery/dist/jquery',
    jquerymobile: '../lib/jquery-mobile/jquery.mobile.custom',
    underscore: '../vendor/underscore/underscore',
    backbone: '../vendor/backbone/backbone',
    handlebars: '../vendor/handlebars/handlebars',
    text: '../vendor/requirejs-text/text',
    sprintf: '../vendor/sprintf/src/sprintf',
    moment: '../vendor/momentjs/moment',
    spin: '../vendor/spinjs/spin'
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
    }
  }

});

require(['underscore', 'jquerymobile', 'handlebars', 'router'], function(_, $, Handlebars, Router) {

  // CARTODB Hacks
  cdb.core.Template.compilers = _.extend(cdb.core.Template.compilers, {
    handlebars: typeof(Handlebars) === 'undefined' ? null : Handlebars.compile
  });

  // Handlebars helper
  Handlebars.registerHelper('plus', function(context) {
    return (context > 0) ? '+' + context : context;
  });

  new Router();

});
