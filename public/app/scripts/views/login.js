'use strict';

define([
  'underscore',
  'backbone',
  'models/user'
], function(_, Backbone, UserModel) {

  var LoginView = Backbone.View.extend({

    el: '#loginFormView',

    events: {
      'submit': 'onSubmit'
    },

    initialize: function() {
      this.user = new UserModel();
    },

    onSubmit: function(e) {
      var params = $(e.currentTarget).serializeArray();

      function callback(err, user) {
        if (err) {
          throw err.responseText;
        } else {
          window.sessionStorage.setItem('token', user.get('token'));
          window.location.href = 'index.html';
        }
      }

      this.user.check(params[0].value, params[1].value, callback);

      e.preventDefault();
    }

  });

  return LoginView;

});
