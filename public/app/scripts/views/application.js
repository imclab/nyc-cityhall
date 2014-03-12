'use strict';

define([
  'underscore',
  'backbone',
  'models/filter'
], function(_, Backbone, filterModel) {

  var ApplicationView = Backbone.View.extend({

    el: '#applicationView',

    events: function() {
      if ('ontouchstart' in window) {
        return {
          'tap #toggleAsideBtn': 'toggle'
        };
      }

      return {
        'click #toggleAsideBtn': 'toggle'
      };
    },

    initialize: function() {
      this.filter = filterModel.instance;
      this.$titles = $('#applicationTitle, #mapTitle');

      this.filter.on('change:type', this.changeTitle, this);
      this.filter.on('change:agency', this.changeTitle, this);

      Backbone.Events.on('application:toggle', this.toggle, this);
      Backbone.Events.on('application:scrolltop', this.scrollTop, this);
    },

    toggle: function() {
      this.$el.toggleClass('is-moved');
    },

    changeTitle: function() {
      var self = this;
      _.delay(function() {
        self.$titles.text($('.mod-aside-content').find('.current').text());
      }, 100);
    },

    show: function() {
      this.$el.addClass('is-active');
    },

    hide: function() {
      this.$el.removeClass('is-active');
    },

    scrollTop: function() {
      this.$el.find('.layout-content').scrollTop(0);
    }

  });

  return ApplicationView;

});
