'use strict';

define([
  'underscore',
  'backbone',
  'models/user'
], function(_, Backbone, UserModel) {

  var LoginView = Backbone.View.extend({

    el: '#loginView',

    events: {
      'submit form': 'onSubmit'
    },

    initialize: function() {
      this.user = new UserModel();
    },

    onSubmit: function(e) {
      var params = $(e.currentTarget).serializeArray();

      function callback(err, user) {
        if (err) {
          window.sessionStorage.removeItem('token');
        } else {
          window.sessionStorage.setItem('token', user.get('token'));
        }

        Backbone.Events.trigger('login:submitted');
      }

      this.user.check(params[0].value, params[1].value, callback);

      e.preventDefault();
    }

  });

  return LoginView;

});
