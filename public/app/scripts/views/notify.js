'use strict';

define(['backbone'], function(Backbone) {

  var NotifyView = Backbone.View.extend({

    el: '#notifyView',

    initialize: function() {
      Backbone.Events.on('notify:show', this.show, this);
      Backbone.Events.on('notify:hide', this.hide, this);
    },

    show: function() {
      var self = this;
      if (this.timer) {
        clearInterval(this.timer);
      }
      this.timer = setInterval(function() {
        self.$el.removeClass('is-hidden');
      }, 300);
    },

    hide: function() {
      if (this.timer) {
        clearInterval(this.timer);
      }
      this.$el.addClass('is-hidden');
    }

  });

  return NotifyView;

});
