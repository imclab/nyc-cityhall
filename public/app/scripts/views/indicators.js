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

      Backbone.on('routeapp', function() {
        console.log('app');
      }, this);

      //this.filter.on('change:period', this.changePeriod, this);
      //this.filter.on('change:sort', this.sortAndRender, this);
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

      //this.changePeriod();
    },

    filterByAgency: function(e) {
      var value = $(e.currentTarget).data('agency');
      this.filter.set('agency', value);
      e.preventDefault();
    },

    changePeriod: function() {
      var self, elements;

      self = this;
      elements = this.$el.find('.mod-indicators-value-item');

      elements.addClass('is-hidden');
      _.each(elements, function(el) {
        var $el = $(el);
        if ($el.data('period') === self.filter.get('period')) {
          $el.removeClass('is-hidden');
        }
      });
    },

    sortAndRender: function() {
      var self = this;

      function sortByPeriod() {
        var comparator;

        switch (self.filter.get('period')) {
        case 'year':
          comparator = 'yearly';
          break;
        case 'month':
          comparator = 'monthly';
          break;
        case 'week':
          comparator = 'weekly';
          break;
        case 'day':
          comparator = 'daily';
          break;
        }

        return comparator;
      }

      switch (this.filter.get('sort')) {
      case 'worst':
        this.indicators.comparator = function(indicator) {
          return indicator.get(sortByPeriod()) / indicator.get('full');
        };
        break;
      case 'best':
        this.indicators.comparator = function(indicator) {
          return -(indicator.get(sortByPeriod()) / indicator.get('full'));
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
