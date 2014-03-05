'use strict';

define([
  'backbone',
  'views/toolbar',
  'views/indicators'
], function(Backbone, ToolbarView, IndicatorsView) {

  var pages, indicatorsPage;

  pages = $('.page');
  indicatorsPage = $('#indicators');

  new ToolbarView();
  new IndicatorsView();

  var Router = Backbone.Router.extend({

    routes: {
      '': 'showIndicators'
    },

    initialize: function() {
      Backbone.history.start({
        pushState: false
      });
    },

    showIndicators: function() {
      pages.removeClass('is-page-active');
      indicatorsPage.addClass('is-page-active');
    }

  });

  return Router;

});
