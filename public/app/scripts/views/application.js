'use strict';

define([
  'backbone'
], function(Backbone) {

  var ApplicationView = Backbone.View.extend({

    el: '#applicationView',

    events: function() {
      if ('ontouchstart' in window) {
        return {
          'touchstart #toggleAsideBtn': 'toggleAside'
        };
      }

      return {
        'click #toggleAsideBtn': 'toggleAside'
      };
    },

    toggleAside: function(e) {
      e.preventDefault();
      this.$el.toggleClass('is-moved');
    }

  });

  return ApplicationView;

});