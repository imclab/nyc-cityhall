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
    jquerymobile: '../lib/jquery.mobile/jquery.mobile.custom',
    cartodb: '../vendor/cartodb.js/dist/cartodb.full.uncompressed',
    spin: '../vendor/spinjs/spin',
    mocha: '../vendor/mocha/mocha',
    chai: '../vendor/chai/chai'
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
    mocha: {
      exports: 'mocha'
    },
    cartodb: {
      exports: 'cartodb'
    }
  }

});

require(['require', 'mocha'], function(require, mocha) {

  mocha.setup('bdd');

  require([
    '../../test/specs/models/agency',
    '../../test/specs/models/filter',
    '../../test/specs/models/indicator',
    '../../test/specs/models/user',

    '../../test/specs/collections/agencies',
    '../../test/specs/collections/indicators',

    '../../test/specs/views/application',
    '../../test/specs/views/aside',
    '../../test/specs/views/login',

    '../../test/specs/views/application/toolbar',
    '../../test/specs/views/application/indicators',

    '../../test/specs/router'
  ], function() {

    (window.mochaPhantomJS || mocha).run();

  });

});
