'use strict';

require.config({

  paths: {
    jquery: '../vendor/jquery/dist/jquery',
    underscore: '../vendor/underscore/underscore',
    backbone: '../vendor/backbone/backbone',
    moment: '../vendor/momentjs/moment',
    sprintf: '../vendor/sprintf/src/sprintf'
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
    sprintf: {
      exports: 'sprintf'
    }
  }

});

require(['backbone', 'views/login'], function(Backbone, LoginView) {

  new LoginView();

});
