'use strict';

define([
  'backbone',
  'models/filter'
], function(Backbone, filterModel) {

  var ToolbarView = Backbone.View.extend({

    el: '#toolbarView',

    options: {
      pause: 3000
    },

    events: function() {
      if ('ontouchstart' in window) {
        return {
          'tap #sortFilter a': 'changeSort',
          'tap #periodFilter a': 'changePeriod',
          'tap .mod-toolbar-current': 'expandOptions'
        };
      }

      return {
        'click #sortFilter a': 'changeSort',
        'click #periodFilter a': 'changePeriod',
        'click .mod-toolbar-current': 'expandOptions',
        'mouseout .mod-toolbar-selector': 'timerToClose',
        'mouseover .mod-toolbar-selector': 'cancelTimerToClose'
      };
    },

    initialize: function() {
      this.filter = filterModel.instance;
      this.$options = this.$el.find('.mod-toolbar-options');
      this.$periodFilter = $('#periodFilter');
      this.$sortFilter = $('#sortFilter');

      this.filter.on('change:period', this.changePeriodLabel, this);
      this.filter.on('change:sort', this.changeSortLabel, this);

      Backbone.Events.on('map:opened map:closed', this.toggleItems, this);
      Backbone.Events.on('filter:close', this.contractOptions, this);
    },

    changePeriod: function(e) {
      this.filter.set('period', $(e.currentTarget).data('value'));

      this.contractOptions();

      e.preventDefault();
    },

    changeSort: function(e) {
      this.filter.set('sort', $(e.currentTarget).data('value'));

      this.contractOptions();

      e.preventDefault();
    },

    changePeriodLabel: function() {
      this.$periodFilter.find('.current').text(this.$el.find('a[data-value="' + this.filter.get('period') + '"]').text());
    },

    changeSortLabel: function() {
      this.$sortFilter.find('.current').text(this.$el.find('a[data-value="' + this.filter.get('sort') + '"]').text());
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

  return ToolbarView;

});
