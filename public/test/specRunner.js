'use strict';

require.config({

  baseUrl: '../app/scripts',

  paths: {
    jquery: '../vendor/jquery/dist/jquery',
    underscore: '../vendor/underscore/underscore',
    backbone: '../vendor/backbone/backbone',
    handlebars: '../vendor/handlebars/handlebars',
    text: '../vendor/requirejs-text/text',
    sprintf: '../vendor/sprintf/src/sprintf',
    moment: '../vendor/momentjs/moment',
    mocha: '../vendor/mocha/mocha',
    chai: '../vendor/chai/chai'
  },

  shim: {
    jquery: {
      exports: '$'
    },
    underscore: {
      exports: '_'
    },
    backbone: {
      deps: ['jquery', 'underscore'],
      exports: 'Backbone'
    },
    handlebars: {
      exports: 'Handlebars'
    },
    sprintf: {
      exports: 'sprintf'
    },
    mocha: {
      exports: 'mocha'
    }
  }

});

require(['require', 'mocha'], function(require, mocha) {

  mocha.setup('bdd');

  require([
    '../../test/specs/models/agency',
    '../../test/specs/collections/agencies',
    '../../test/specs/views/agencies',
    '../../test/specs/router'
  ], function() {

    (window.mochaPhantomJS || mocha).run();

  });

});
