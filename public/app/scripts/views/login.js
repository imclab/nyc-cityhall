'use strict';

define([
  'backbone',
  'models/user'
], function(Backbone) {

  var LoginView = Backbone.View.extend({

    el: '#loginFormView',

    events: {
      'submit': 'onSubmit'
    },

    onSubmit: function(e) {
      var params = $(e.currentTarget).serializeArray();
      console.log(params);
      e.preventDefault();
    }

  });

  return LoginView;

});
