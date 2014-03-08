'use strict';

define([
  'underscore',
  'backbone',
  'handlebars',
  'models/filter',
  'collections/indicators',
  'text!../../../templates/indicators-list.handlebars'
], function(_, Backbone, Handlebars, filterModel, IndicatorsCollection, tpl) {

  var IndicatorsView = Backbone.View.extend({

    el: '#indicatorsView',

    events: function() {
      if ('ontouchstart' in window) {
        return {
          'tap .mod-indicators-item': 'openMapView'
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
      this.filter.on('change:type', this.filterByType, this);
    },

    getData: function() {
      var self = this;

      if (this.indicators.length > 0) {
        this.indicators.set(this.indicators.getDataByFilters(), {remove: true});
        this.sortAndRender();
      } else {
        this.indicators.getData(function(err) {
          if (err) {
            window.sessionStorage.removeItem('token');
            window.location.hash = 'login';
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
      e.stopPropagation();
    },

    filterByAgency: function() {
      var $mods = $('.mod-indicators-item');
      if (this.filter.get('agency') === 'all') {
        $mods.removeClass('is-hidden');
      } else {
        $mods.addClass('is-hidden');
        $('.mod-indicators-item[data-agency="' + this.filter.get('agency') + '"]').removeClass('is-hidden');
      }
    },

    filterByType: function() {

      var $mods = $('.mod-indicators-item');
      if (this.filter.get('type') === 'all') {
        $mods.removeClass('is-hidden');
      } else if (this.filter.get('type') === 'improving') {

        $mods.addClass('is-hidden');
        $('.mod-indicators-item[data-status="improving"]').removeClass('is-hidden');
        //$('.mod-indicators-item[data-agency<>"' + this.filter.get('agency') + '"]').addClass('is-hidden');
      } else if (this.filter.get('type') === 'worsening') {
        $mods.addClass('is-hidden');
        $('.mod-indicators-item[data-status="worsening"]').removeClass('is-hidden');
      } else if (this.filter.get('type') === 'urgent') {
        $mods.addClass('is-hidden');
        $('.mod-indicators-item[data-urgent="true"]').removeClass('is-hidden');
      }

    },

    sortAndRender: function() {
      // function getValue(indicator) {
      //   return Number(indicator.get('value').split('%')[0]);
      // }

      switch (this.filter.get('sort')) {
      case 'worst':

        this.indicators.comparator = function(indicator) {
          if(indicator.get('value')===null || indicator.get('full')===0) {return 0;}
          return indicator.get('value') / indicator.get('full');
        };
        break;
      case 'best':
        this.indicators.comparator = function(indicator) {
          if(indicator.get('value')===null || indicator.get('full')===0) {return 0;}
          return -(indicator.get('value') / indicator.get('full'));
        };
        break;
      case 'department':
        this.indicators.comparator = 'agency';
        break;
      }

      this.indicators.sort();
      this.render();
      this.filterByAgency();
    },

    openMapView: function(e) {
      var indicator = this.indicators.get($(e.currentTarget).data('id'));

      Backbone.Events.trigger('map:open', indicator.toJSON());
    }

  });

  return IndicatorsView;

});
