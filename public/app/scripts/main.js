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

  // Number extension
  Number.prototype.toCommas = function() {
    return this.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

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
    if (context === null || context === undefined) {
      return '-';
    }

    if (typeof context === 'string') {
      return context;
    }

    if (context - Math.floor(context) !== 0) {
      context = Number(context.toFixed(1));
    }

    if (!units) {
      return context.toCommas();
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

    if (units === 'seconds') {
      if (context > 0) {
        return moment().hours(0).minutes(0).seconds(context).format('HH:mm:ss');
      }
      return '-' + moment().hours(0).minutes(0).seconds(Math.abs(context)).format('HH:mm:ss');
    }

    return context.toCommas();
  });

  Handlebars.registerHelper('xif', function (context, options) {
    var result = !(context === undefined || context === null);
    return (result) ? options.fn(this) : options.inverse(this);
  });

  new Router();

});
