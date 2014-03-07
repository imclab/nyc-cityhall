'use strict';

define([
  'backbone'
], function(Backbone) {

  var ApplicationView = Backbone.View.extend({

    el: '#applicationView',

    events: function() {
      if ('ontouchstart' in window) {
        return {
          'tap #toggleAsideBtn': 'toggleAside'
        };
      }

      return {
        'click #toggleAsideBtn': 'toggleAside'
      };
    },

    initialize: function() {
      Backbone.Events.on('application:toggle', this.toggleAside, this);
    },

    toggleAside: function() {
      this.$el.toggleClass('is-moved');
    }

  });

  return ApplicationView;

});
