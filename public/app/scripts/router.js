'use strict';

define([
  'backbone',
  'views/application',
  'views/map',
  'views/login',
  'views/aside',

  'views/application/toolbar',
  'views/application/indicators',

  'views/map/indicator'
], function(Backbone, ApplicationView, MapView, LoginView, AsideView, ToolbarView, IndicatorsView, MapIndicatorView) {

  var app = {}, Router;

  app.application = new ApplicationView();
  app.login = new LoginView();
  app.aside = new AsideView();
  app.toolbar = new ToolbarView();
  app.indicators = new IndicatorsView();

  app.map = new MapView();
  app.mapIndicator = new MapIndicatorView();

  Router = Backbone.Router.extend({

    routes: {
      'login': 'showLogin',
      'app': 'showApp'
    },

    initialize: function() {
      Backbone.history.start({
        pushState: false
      });

      Backbone.Events.on('login:submitted', this.checkAuth, this);

      this.checkAuth();
    },

    showLogin: function() {
      app.application.$el.addClass('is-hidden');
      app.aside.$el.addClass('is-hidden');
      app.login.$el.removeClass('is-hidden');
    },

    showApp: function() {
      app.login.$el.addClass('is-hidden');
      app.aside.$el.removeClass('is-hidden');
      app.application.$el.removeClass('is-hidden');
      if (window.sessionStorage.getItem('token')) {
        app.indicators.getData();
      }
    },

    checkAuth: function() {
      if (!window.sessionStorage.getItem('token')) {
        this.navigate('login', {
          trigger: true
        });
      } else {
        this.navigate('app', {
          trigger: true
        });
      }
    }

  });

  return Router;

});
