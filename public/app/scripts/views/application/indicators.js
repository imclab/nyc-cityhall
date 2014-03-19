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
        this.indicators.set(this.indicators.getDataByFilters(), {
          remove: true
        });
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

    filterByAgency: function() {
      var $mods = $('.mod-indicators-item');
      $mods.addClass('is-hidden');

      this.filter.set({
        type: 'all'
      }, {
        silent: true
      });

      if (this.filter.get('agency') === 'all') {
        $mods.removeClass('is-hidden');
      } else {
        $mods.addClass('is-hidden');
        $('.mod-indicators-item[data-agency="' + this.filter.get('agency') + '"]').removeClass('is-hidden');
      }

      Backbone.Events.trigger('application:scrolltop');
    },

    filterByType: function() {
      var $mods = $('.mod-indicators-item');

      $mods.addClass('is-hidden');

      this.filter.set({
        agency: 'all'
      }, {
        silent: true
      });

      if (this.filter.get('type') === 'all') {
        $mods.removeClass('is-hidden');
      } else if (this.filter.get('type') === 'improving') {
        $('.mod-indicators-item[data-status="improving"]').removeClass('is-hidden');
      } else if (this.filter.get('type') === 'worsening') {
        $('.mod-indicators-item[data-status="worsening"]').removeClass('is-hidden');
      } else if (this.filter.get('type') === 'urgent') {
        $('.mod-indicators-item[data-urgent="true"]').removeClass('is-hidden');
      } else {
        $('.mod-indicators-item[data-type="' + this.filter.get('type') + '"]').removeClass('is-hidden');
      }

      Backbone.Events.trigger('application:scrolltop');
    },

    sortAndRender: function() {
      switch (this.filter.get('sort')) {
        case 'default':

          this.indicators.comparator = function(indicator) {
            var score = 0;

            if (indicator.get('isnull')) {
              score = 1000000;
            } else if (indicator.get('value') === null || indicator.get('full') === 0) {
              score = 100000;
            } else{
              score = -indicator.get('value') / indicator.get('full');
            }

            if(indicator.get('type')==='basic_services'){
              score=score-10000000000000;
            }

            if(indicator.get('type')==='public_service'){
              score=score+10000000000000;
            }
            console.log(score,indicator.get('type'),indicator.get('name'));
            return score;

          };

          break;
        case 'worst':
          this.indicators.comparator = function(indicator) {
            if (indicator.get('isnull')) {
              return 100000000;
            }
            if (indicator.get('value') === null || indicator.get('full') === 0) {
              return 1000000;
            }
            return indicator.get('value') / indicator.get('full');
          };
          break;
        case 'best':
          this.indicators.comparator = function(indicator) {
            if (indicator.get('isnull')) {
              return 100000000;
            }
            if (indicator.get('value') === null || indicator.get('full') === 0) {
              return 1000000;
            }
            return -(indicator.get('value') / indicator.get('full'));
          };
          break;
        case 'department':
          this.indicators.comparator = 'agency';
          break;
        default:
          this.indicators.comparator = 'defaultOrder';
          break;
      }

      this.indicators.sort();

      this.render();

      if (this.filter.get('agency') !== 'all') {
        this.filterByAgency();
      } else if (this.filter.get('type') !== 'all') {
        this.filterByType();
      }

      Backbone.Events.trigger('application:scrolltop');
    },

    openMapView: function(e) {
      var indicator;

      indicator = this.indicators.get($(e.currentTarget).data('id'));

      if (indicator.get('historicalGeo')) {
        this.currentPeriod =  this.filter.get('period');

        this.filter.set({
          period: 'mmwwdd'
        }, {
          silent: true
        });

        indicator = _.findWhere(this.indicators.getDataByFilters(), {id: indicator.id});

        this.filter.set({
          period: this.currentPeriod
        }, {
          silent: true
        });

      } else {
        indicator = indicator.toJSON();
      }

      if (indicator.geoType1 !== null && indicator.geoType1 !== '') {
        Backbone.Events.trigger('map:open', indicator);
      }
    }

  });

  return IndicatorsView;

});
