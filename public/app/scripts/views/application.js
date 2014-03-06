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

    initialize: function() {
      Backbone.Events.on('application:toggle', this.toggleAside, this);
    },

    toggleAside: function(e) {
      if (e && e.preventDefault) {
        e.preventDefault();
      }
      this.$el.toggleClass('is-moved');
    }

  });

  return ApplicationView;

});
