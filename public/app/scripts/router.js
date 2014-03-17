'use strict';

define([
  'underscore',
  'backbone',
  'views/application',
  'views/map',
  'views/login',
  'views/aside',

  'views/application/toolbar',
  'views/application/indicators',

  'views/map/indicator',
  'views/map/spin',
  'views/map/toolbar'
], function(_, Backbone, ApplicationView, MapView, LoginView, AsideView, ToolbarView, IndicatorsView, MapIndicatorView, MapSpinView, MapToolbarView) {

  var app = {}, Router;

  app.application = new ApplicationView();
  app.login = new LoginView();
  app.aside = new AsideView();
  app.toolbar = new ToolbarView();
  app.indicators = new IndicatorsView();

  app.map = new MapView();
  app.mapIndicator = new MapIndicatorView();
  app.mapSpinView = new MapSpinView();
  app.mapToolbarView = new MapToolbarView();

  Router = Backbone.Router.extend({

    routes: {
      'login': 'showLogin',
      'app': 'showApp'
    },

    initialize: function() {
      console.log('initialize');
      Backbone.history.start({
        pushState: false
      });

      Backbone.Events.on('login:submitted', this.checkAuth, this);

      this.checkAuth();
    },

    showLogin: function() {
      app.application.hide();
      app.map.hide();
      app.login.show();
      this.checkAuth();
    },

    showApp: function() {
      app.login.hide();
      app.map.hide();

      app.application.show();
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
