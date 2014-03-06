'use strict';

define([
  'underscore',
  'backbone',
  'handlebars',
  'models/filter',
  'collections/indicators',
  'text!../../templates/indicators.handlebars'
], function(_, Backbone, Handlebars, filterModel, IndicatorsCollection, tpl) {

  var IndicatorsView = Backbone.View.extend({

    el: '#indicatorsView',

    events: function() {
      if ('ontouchstart' in window) {
        return {
          'touchstart .mod-indicators-agency': 'filterByAgency',
          'touchstart .mod-indicators-item': 'openMapView'
        };
      }

      return {
        'click .mod-indicators-agency': 'filterByAgency',
        'click .mod-indicators-item': 'openMapView'
      };
    },

    template: Handlebars.compile(tpl),

    initialize: function() {
      this.filter = filterModel.instance;
      this.indicators = new IndicatorsCollection();

      this.filter.on('change:period', this.getData, this);
      this.filter.on('change:sort', this.sortAndRender, this);
    },

    getData: function() {
      var self = this;

      this.indicators.getData(function(err) {
        if (err) {
          console.log(err.responseText);
        } else {
          self.sortAndRender();
        }
      });
    },

    render: function() {
      this.$el.html(this.template({
        indicators: this.indicators.toJSON()
      }));
    },

    filterByAgency: function(e) {
      var value = $(e.currentTarget).data('agency');
      this.filter.set('agency', value);
      e.preventDefault();
    },

    sortAndRender: function() {
      function getValue(indicator) {
        return Number(indicator.get('value').split('%')[0]);
      }

      switch (this.filter.get('sort')) {
      case 'worst':
        this.indicators.comparator = function(indicator) {
          return getValue(indicator) / indicator.get('full');
        };
        break;
      case 'best':
        this.indicators.comparator = function(indicator) {
          return -(getValue(indicator) / indicator.get('full'));
        };
        break;
      case 'department':
        this.indicators.comparator = 'agency';
        break;
      }

      this.indicators.sort();
      this.render();
    },

    openMapView: function() {
      Backbone.Events.trigger('map:open');
    }

  });

  return IndicatorsView;

});
