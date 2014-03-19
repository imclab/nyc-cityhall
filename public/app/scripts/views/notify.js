'use strict';

define(['underscore', 'backbone'], function(_, Backbone) {

  var NotifyView = Backbone.View.extend({

    el: '#notifyView',

    initialize: function() {
      Backbone.Events.on('notify:show', this.show, this);
      Backbone.Events.on('notify:hide', this.hide, this);
    },

    show: function() {
      var self = this;
      _.delay(function() {
        self.$el.removeClass('is-hidden');
      }, 300);
    },

    hide: function() {
      this.$el.addClass('is-hidden');
    }

  });

  return NotifyView;

});
