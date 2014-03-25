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

require(['underscore', 'jquerymobile', 'handlebars', 'moment', 'router'], function(_, $, Handlebars, moment, Router) {

  // CARTODB Hacks
  cdb.core.Template.compilers = _.extend(cdb.core.Template.compilers, {
    handlebars: typeof(Handlebars) === 'undefined' ? null : Handlebars.compile
  });

  // Handlebars helper
  Handlebars.registerHelper('plus', function(context) {
    var result = (context > 0) ? '+' + context : context;
    return result + '%';
  });

  Handlebars.registerHelper('commas', function(context, units) {
    if (context === null) {
      return null;
    }

    context = context.toString();
    context = context.replace(',', '');
    context = context.replace('%', '');

    if (context === '-') {
      return '-';
    }

    context = Number(context);

    if (context % 1 !== 0) {
      context = context.toFixed(2);
    }

    if (units === 'percentage') {
      return context.toString() + '%';
    }

    if (units === 'seconds') {
      if (context > 0) {
        return moment().hours(0).minutes(0).seconds(context).format('HH:mm:ss');
      }
      return '-' + moment().hours(0).minutes(0).seconds(Math.abs(context)).format('HH:mm:ss');
    }
    return context.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  });

  new Router();

});
