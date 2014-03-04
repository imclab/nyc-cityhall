'use strict';

define([
  'backbone',
  'views/agencies'
], function(Backbone, AgenciesView) {

  var pages, headerPage, indexPage, agencyPage, indicatorPage;

  pages = $('.page');
  headerPage = $('#header');
  indexPage = $('#index');
  agencyPage = $('#agency');
  indicatorPage = $('#indicator');

  new AgenciesView();

  var Router = Backbone.Router.extend({

    routes: {
      '': 'showIntro',
      'agency/:agency': 'showAgency',
      'agency/:agency/indicator/:indicator': 'showIndicator'
    },

    initialize: function() {
      Backbone.history.start({
        pushState: false
      });
    },

    showIntro: function() {
      console.log('intro');
      headerPage.addClass('is-hidden');
      pages.removeClass('is-page-active');
      indexPage.addClass('is-page-active');
    },

    showAgency: function(agency) {
      console.log('agency: ' + agency);
      headerPage.removeClass('is-hidden');
      pages.removeClass('is-page-active');
      agencyPage.addClass('is-page-active');
    },

    showIndicator: function(agency, indicator) {
      console.log('agency: ' + agency, ' and indicator: ' + indicator);
      headerPage.removeClass('is-hidden');
      pages.removeClass('is-page-active');
      indicatorPage.addClass('is-page-active');
    }

  });

  return Router;

});
