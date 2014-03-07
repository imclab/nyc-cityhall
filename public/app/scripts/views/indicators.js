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
          'touchstart .mod-indicators-agency': 'setAgency',
          'touchstart .mod-indicators-item': 'openMapView'
        };
      }

      return {
        'click .mod-indicators-agency': 'setAgency',
        'click .mod-indicators-item': 'openMapView'
      };
    },

    template: Handlebars.compile(tpl),

    initialize: function() {
      this.filter = filterModel.instance;
      this.indicators = new IndicatorsCollection();

      this.filter.on('change:period', this.getData, this);
      this.filter.on('change:sort', this.sortAndRender, this);
      this.filter.on('change:agency', this.filterByAgency, this);
    },

    getData: function() {
      var self = this;

      if (this.indicators.length > 0) {
        this.indicators.set(this.indicators.getDataByFilters(), {remove: true});
        this.sortAndRender();
      } else {
        this.indicators.getData(function(err) {
          if (err) {
            console.log(err.responseText);
          } else {
            self.sortAndRender();
          }
        });
      }
    },

    render: function() {
      this.$el.html(this.template({
        indicators: this.indicators.toJSON()
      }));
    },

    setAgency: function(e) {
      var value = $(e.currentTarget).data('agency');
      this.filter.set('agency', value);
      e.preventDefault();
    },

    filterByAgency: function() {
      if (this.filter.get('agency') === 'all') {
        $('.mod-indicators-layout').removeClass('is-hidden');
      } else {
        $('.mod-indicators-layout').addClass('is-hidden');
        $('.mod-indicators-layout[data-agency="' + this.filter.get('agency') + '"]').removeClass('is-hidden');
      }
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
