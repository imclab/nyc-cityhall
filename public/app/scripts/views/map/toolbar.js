'use strict';

define([
  'backbone',
  'models/filter'
], function(Backbone, filterModel) {

  var MapToolbarView = Backbone.View.extend({

    el: '#mapToolbarView',

    options: {
      pause: 3000
    },

    events: function() {
      if ('ontouchstart' in window) {
        return {
          'tap .mod-toolbar-selector a': 'changePeriod',
          'tap .mod-toolbar-current': 'expandOptions'
        };
      }

      return {
        'click .mod-toolbar-selector a': 'changePeriod',
        'click .mod-toolbar-current': 'expandOptions',
        'mouseout .mod-toolbar-selector': 'timerToClose',
        'mouseover .mod-toolbar-selector': 'cancelTimerToClose'
      };
    },

    initialize: function() {
      this.filter = filterModel.instance;
      this.$options = this.$el.find('.mod-toolbar-options');
      this.$latestValues = $('#latestValues');

      this.filter.on('change:period', this.changePeriodLabel, this);

      Backbone.Events.on('map:opened', this.toggleLatestValues, this);
      Backbone.Events.on('map:closed', this.contractOptions, this);
    },

    changePeriod: function(e) {
      this.filter.set('period', $(e.currentTarget).data('value'));

      this.contractOptions();

      e.preventDefault();
    },

    changePeriodLabel: function() {
      this.$el.find('.current').text(this.$el.find('a[data-value="' + this.filter.get('period') + '"]').text());
    },

    toggleLatestValues: function(historical) {
      if (historical) {
        this.$latestValues.show();
      } else {
        this.$latestValues.hide();
      }
    },

    expandOptions: function(e) {
      var currentOptions, expanded;

      currentOptions = $(e.currentTarget).closest('li').find('.mod-toolbar-options');
      expanded = currentOptions.hasClass('is-expanded');

      this.contractOptions();

      if (expanded) {
        currentOptions.removeClass('is-expanded');
      } else {
        currentOptions.addClass('is-expanded');
      }
    },

    contractOptions: function() {
      this.$options.removeClass('is-expanded');
      this.cancelTimerToClose();
    },

    timerToClose: function() {
      var self = this;

      this.timer = setInterval(function() {
        self.contractOptions();
      }, this.options.pause);

      $(document).on('click', function() {
        self.contractOptions();
        self.cancelTimerToClose();
      });
    },

    cancelTimerToClose: function() {
      if (this.timer) {
        clearInterval(this.timer);
      }
      $(document).off('click');
    }

  });

  return MapToolbarView;

});
