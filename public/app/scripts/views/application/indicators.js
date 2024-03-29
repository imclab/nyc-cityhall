'use strict';

define([
  'underscore',
  'backbone',
  'handlebars',
  'models/filter',
  'collections/indicators',
  'text!../../../templates/indicators-list.handlebars'
], function(_, Backbone, Handlebars, filterModel, indicatorsCollection, tpl) {

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
      this.indicators = indicatorsCollection.instance;

      this.filter.on('change:period', this.getData, this);
      this.filter.on('change:sort', this.sortAndRender, this);
      this.filter.on('change:agency', this.filterByAgency, this);
      this.filter.on('change:type', this.filterByType, this);
    },

    getData: function() {
      var self = this;

      if (this.filter.get('period') === 'latest') {
        return false;
      }

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
            var result, score;

            switch(indicator.get('type')) {
              case 'basic_services':
                score = 2000;
                break;
              case 'equality_measure':
                score = 3000;
                break;
              case 'public_service':
                score = 4000;
                break;
            }

            if (indicator.get('displayValue') === '-') {
              result = score + 550;
            } else if (isFinite(indicator.get('value') / indicator.get('full'))) {
              result = score + (indicator.get('value') / indicator.get('full'));
            } else {
              result = score + 500;
            }

            return result;

          };
          break;

        case 'worst':
          this.indicators.comparator = function(indicator) {
            if (indicator.get('displayValue') === '-') {
              return 4000;
            } else if (!isFinite(indicator.get('value') / indicator.get('full'))) {
              return 3000 + Number(indicator.get('value'));
            }
            return indicator.get('value') / indicator.get('full');
          };
          break;

        case 'best':
          this.indicators.comparator = function(indicator) {
            if (indicator.get('displayValue') === '-') {
              return 4000;
            } else if (!isFinite(indicator.get('value') / indicator.get('full'))) {
              return 3000 - Number(indicator.get('value'));
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
      Backbone.Events.trigger('map:open', $(e.currentTarget).data('id'));
    }

  });

  return IndicatorsView;

});
