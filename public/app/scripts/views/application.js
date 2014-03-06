'use strict';

define([
  'backbone'
], function(Backbone) {

  var ApplicationView = Backbone.View.extend({

    el: '#applicationView',

    events: {
      'click #toggleAsideBtn': 'toggleAside'
    },

    toggleAside: function(e) {
      e.preventDefault();
      this.$el.toggleClass('is-moved');
    }

  });

  return ApplicationView;

});
