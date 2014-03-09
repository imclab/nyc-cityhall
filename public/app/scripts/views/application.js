'use strict';

define([
  'backbone',
  'models/filter'
], function(Backbone, filterModel) {

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

      Backbone.Events.on('application:toggle', this.toggle, this);
    },

    toggle: function() {
      this.$el.toggleClass('is-moved');
    },

    changeTitle: function() {
      this.$titles.text($('.mod-aside-types').find('a[data-type="' + this.filter.get('type') + '"]').text());
    },

    show: function() {
      this.$el.addClass('is-active');
    },

    hide: function() {
      this.$el.removeClass('is-active');
    }

  });

  return ApplicationView;

});
