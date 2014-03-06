'use strict';

define([
  'backbone'
], function(Backbone) {

  var MapView = Backbone.View.extend({

    el: '#mapView',

    events: function() {
      if ('ontouchstart' in window) {
        return {
          'touchstart .mod-map-close': 'close'
        };
      }

      return {
        'click .mod-map-close': 'close'
      };
    },

    initialize: function() {
      Backbone.Events.on('map:open', this.open, this);
    },

    open: function() {
      this.$el.addClass('is-active');
    },

    close: function() {
      this.$el.removeClass('is-active');
    }

  });

  return MapView;

});
