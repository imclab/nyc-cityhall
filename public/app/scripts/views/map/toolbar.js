'use strict';

define([
  'backbone',
  'models/indicator'
], function(Backbone, IndicatorModel) {

  var MapToolbarView = Backbone.View.extend({

    el: '#mapToolbarView',

    options: {
      pause: 3000
    },

    events: function() {
      if ('ontouchstart' in window) {
        return {
          'tap .mod-toolbar-selector a': 'changeMap',
          'tap .mod-toolbar-current': 'expandOptions'
        };
      }

      return {
        'click .mod-toolbar-selector a': 'changeMap',
        'click .mod-toolbar-current': 'expandOptions',
        'mouseout .mod-toolbar-selector': 'timerToClose',
        'mouseover .mod-toolbar-selector': 'cancelTimerToClose'
      };
    },

    initialize: function() {
      this.indicator = new IndicatorModel();
      this.$options = this.$el.find('.mod-toolbar-options');
      this.$historyOption = $('#historyOption');
      this.$currentOption = $('#currentOption');

      Backbone.Events.on('map:closed', this.contractOptions, this);
      Backbone.Events.on('map:done', this.changeData, this);
    },

    changeData: function(data) {
      this.indicator.set(data);

      if (this.indicator.get('historicalGeo')) {
        this.$historyOption.show();
        this.$el.find('.current').text(this.$historyOption.text());
        Backbone.Events.trigger('map:toggle', 'history');
      } else {
        this.$historyOption.hide();
        this.$el.find('.current').text(this.$currentOption.text());
        Backbone.Events.trigger('map:toggle', 'current');
      }
    },

    changeMap: function(e) {
      var element, current;

      element = $(e.currentTarget),
      current = element.closest('.mod-toolbar-selector').find('.current');

      current.text(element.text());

      Backbone.Events.trigger('map:toggle', element.data('value'));

      this.contractOptions();

      e.preventDefault();
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
