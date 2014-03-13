'use strict';

define([
  'backbone',
  'handlebars',
  'models/indicator',
  'text!../../../templates/toolbar-map.handlebars'
], function(Backbone, Handlebars, IndicatorModel, tpl) {

  var MapToolbarView = Backbone.View.extend({

    el: '#mapToolbarView',

    options: {
      pause: 3000
    },

    events: function() {
      if ('ontouchstart' in window) {
        return {
          'tap .mod-toolbar-selector a': 'changeMap',
          'tap .mod-toolbar-selector .current': 'expandOptions'
        };
      }

      return {
        'click .mod-toolbar-selector a': 'changeMap',
        'click .mod-toolbar-selector .current': 'expandOptions',
        'mouseout .mod-toolbar-selector': 'timerToClose',
        'mouseover .mod-toolbar-selector': 'cancelTimerToClose'
      };
    },

    template: Handlebars.compile(tpl),

    initialize: function() {
      this.indicator = new IndicatorModel();
      this.$options = this.$el.find('.mod-toolbar-options');

      Backbone.Events.on('map:closed', this.contractOptions, this);
      Backbone.Events.on('map:changed', this.changeData, this);
    },

    render: function() {
      console.log(this.data);
      this.$el.html(this.template(this.data));
    },

    changeData: function(data) {
      this.indicator.set(data);

      this.data = {};

      if (!this.indicator.get('historicalGeo')) {
        this.data.mmddyy = true;
      }

      console.log(this.indicator);

      this.render();
    },

    changeMap: function(e) {
      var element, current;

      element = $(e.currentTarget),
      current = element.closest('.mod-toolbar-selector').find('.current');

      current.text(element.text());

      this.contractOptions();

      if (this.indicator.get('historicalGeo')) {
        // last_monthdayyear
      } else {
        // current
      }

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
