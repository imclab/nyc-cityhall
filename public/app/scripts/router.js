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
      app.application.hide();
      app.map.hide();
      app.aside.hide();
      app.login.show();
    },

    showApp: function() {
      app.login.hide();
      app.map.hide();

      _.delay(function() {
        app.application.show();
        if (window.sessionStorage.getItem('token')) {
          app.indicators.getData();
        }
      }, 300);

      _.delay(function() {
        app.aside.show();
      }, 600);
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
