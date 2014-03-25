'use strict';

define([
  'underscore',
  'backbone',
  'handlebars',
  'sprintf',
  'moment',
  'models/filter',
  'models/indicator',
  'collections/indicators',
  'text!../../templates/infowindow.handlebars',
  'text!../../templates/infowindow-historical.handlebars'
], function(_, Backbone, Handlebars, sprintf, moment, filterModel, IndicatorModel, indicatorsCollection, infowindowTpl, infowindowHistoricalTpl) {

  var MapView = Backbone.View.extend({

    el: '#mapView',

    options: {
      canvas: 'map',
      map: {
        zoomControl: false,
        center: [40.7, -74],
        zoom: 11,
        minZoom: 10
      },
      tiles: {
        url: 'https://{s}.tiles.mapbox.com/v3/d4weed.hf61abb1/{z}/{x}/{y}.png',
        attribution: 'Mapbox'
      },
      cartodb: {
        user_name: 'nyc-cityhall',
        type: 'cartodb',
        legends: true
      },
      colors: ['#088246', '#379d4e', '#66b757', '#95d25f', '#b1de79', '#cce994', '#e8f5ae', '#fff8c3', '#fddc9f', '#fbbe79', '#faa052', '#f8822c', '#ef632b', '#e7452b', '#de262a'],
      neutralcolors: ['#4e6859', '#758d79', '#99ad94', '#b4c3a7', '#cdd8bf', '#e3ead6', '#fafaed', '#f9faed', '#ffffff', '#f9f5e6', '#e9dbcb', '#d5c0ae', '#c3a693', '#bd9b8f', '#b68e8a', '#a17177'],
      abscolors: ['#344a5f', '#4e647a', '#687d94', '#8397af', '#9db0ca', '#b7c9e4', '#d1e3ff']
    },

    events: function() {
      if ('ontouchstart' in window) {
        return {
          'touchstart #mapTitle button': 'hide'
        };
      }

      return {
        'click #mapTitle button': 'hide'
      };
    },

    initialize: function() {
      this.sql = new cartodb.SQL({
        user: this.options.cartodb.user_name
      });
      this.indicators = indicatorsCollection.instance;
      this.indicator = new IndicatorModel();
      this.filter = filterModel.instance;

      this.setMap();
      this.setTiles();

      this.filter.on('change:period', this.setIndicator, this);
      Backbone.Events.on('map:open', this.show, this);
    },

    setMap: function() {
      this.map = L.map(this.options.canvas, this.options.map);
    },

    setTiles: function() {
      var tiles;

      if (this.tiles) {
        this.map.removeLayer(this.tiles);
      }

      tiles = L.tileLayer(this.options.tiles.url, {
        attribution: this.options.tiles.attribution
      });

      this.tiles = tiles;

      this.tiles.addTo(this.map);
    },

    changeVisualization: function() {
      var self, period, indicator;

      if (!this.$el.hasClass('is-active')) {
        return false;
      }

      self = this;
      indicator = this.indicator.toJSON();
      period = this.filter.get('period');

      Backbone.Events.trigger('map:changed', indicator);

      if (this.currentLegend) {
        $(this.currentLegend.render().el).remove();
      }

      if (this.infowindow) {
        this.infowindow._closeInfowindow();
      }

      if (!this.indicator.get('historicalGeo')) {
        if (this.tiles) {
          this.map.removeLayer(this.tiles);
          this.tiles = null;
        }
        Backbone.Events.trigger('notify:show');
        return false;
      }

      Backbone.Events.trigger('spinner:start');

      switch(this.filter.get('period')) {
        case 'mmwwdd':
          this.currentData = 'last_monthdayyear';
          break;
        case 'fytd':
          this.currentData = 'last_fytd';
          break;
        case 'lastyear':
          this.currentData = 'last_year_previous';
          break;
        case 'latest':
          this.currentData = 'latest';
          break;
        default:
          this.currentData = null;
          if (this.tiles) {
            this.map.removeLayer(this.tiles);
          }
          Backbone.Events.trigger('notify:show');
          Backbone.Events.trigger('spinner:stop');
          return false;
      }

      Backbone.Events.trigger('notify:hide');

      function addLayerToMap(layer) {
        self.currentLayer = layer;
        self.map.setView(self.options.map.center, self.options.map.zoom);
        self.map.addLayer(layer);
        self.setLegend();
        self.setInfowindow();

        self.currentLayer.getSubLayer(0).on('featureClick', function(e, latlng, point, data) {
          console.log(data);
        });

        Backbone.Events.trigger('spinner:stop');
      }

      if (this.currentLayer) {

        this.currentLayer.getSubLayer(0).set({cartocss: this.getCartoCSS()});
        this.setLegend();
        this.setInfowindow();
        Backbone.Events.trigger('spinner:stop');

      } else {

        var sql = sprintf('WITH indicator AS (SELECT * FROM get_agg_geo(\'%1$s\',\'%2$s\',\'%3$s\',\'%4$s\',\'%5$s\')) SELECT g.cartodb_id, g.the_geom, g.geo_id, g.name, g.the_geom_webmercator, i.current, i.previous, CASE WHEN i.previous = 0 THEN sign(i.current) * 100 ELSE CASE WHEN i.previous IS NOT NULL THEN trunc(100*(i.current - i.previous)/i.previous, 1) ELSE null END END as last_monthdayyear, CASE WHEN i. previous_fytd = 0 THEN sign(i. current_fytd) * 100 ELSE CASE WHEN i.previous_fytd IS NOT NULL THEN trunc(100*(i.current_fytd - i.previous_fytd)/i.previous_fytd, 1) ELSE null END END as last_fytd, CASE WHEN i. previous_year_period = 0 THEN sign(i. current) * 100 ELSE CASE WHEN i.previous_year_period IS NOT NULL THEN trunc(100*(i.current - i.previous_year_period)/i.previous_year_period, 1) ELSE null END END as last_year_previous FROM %2$s g LEFT OUTER JOIN indicator i ON (g.geo_id = i.geo_id)', indicator.id, indicator.geoType1, indicator.date, window.sessionStorage.getItem('token'), (moment().format('HH') / 4).toFixed(0));

        _.delay(function() {
          self.getMinMax(function() {
            var options = _.extend({}, self.options.cartodb, {
              interactivity: (period !== 'latest' && indicator.historicalGeo) ? 'name, last_monthdayyear, last_fytd, last_year_previous, current, previous, previous_fytd, current_fytd' : 'name, current',
              sublayers: [{
                sql: sql,
                cartocss: self.getCartoCSS()
              }]
            });

            cartodb.createLayer(self.map, options, {https: true})
              .on('done', addLayerToMap)
              .on('error', function(err) {
                throw err;
              });
          });
        }, 301);

        if (!this.tiles) {
          this.setTiles();
        }

      }
    },

    setIndicator: function() {
      var self = this;

      if (this.filter.get('period') === 'latest') {
        this.changeVisualization();
      } else {
        if (this.indicators.length > 0) {
          this.indicators.set(this.indicators.getDataByFilters(), {
            remove: true
          });
          this.indicator.set(this.indicators.get(this.currentId).toJSON());
          this.changeVisualization();
        } else {
          this.indicators.getData(function() {
            self.indicator.set(self.indicators.get(self.currentId).toJSON());
            self.changeVisualization();
          });
        }
      }
    },

    getMinMax: function(callback) {
      var self = this;

      this.sql.execute('SELECT * FROM get_geo_summary(\'{{indicator}}\', \'{{geotype}}\', \'{{{date}}}\', \'{{token}}\', \'{{cache}}\')', {
        indicator: this.indicator.get('id'),
        geotype: this.indicator.get('geoType1'),
        date: this.indicator.get('date'),
        token: window.sessionStorage.getItem('token'),
        cache: (moment().format('HH') / 4).toFixed(0)
      })
        .done(function(data) {
          self.currentMin = data.rows[0].current_min;
          self.currentMax = data.rows[0].current_max;
          if (callback && typeof callback === 'function') {
            callback();
          }
        })
        .error(function(errors) {
          throw errors;
        });
    },

    getCartoCSS: function() {
      var cartocss, indicator, period, self;

      self = this;
      indicator = this.indicator.toJSON();
      period = this.filter.get('period');

      cartocss = sprintf('#%s {polygon-fill: #777; line-color: #292929;  line-width: 1; polygon-opacity: 0.7; }', indicator.id);

      if (period !== 'latest') {

        if (indicator.full !== 0 && indicator.displayValue !== '-') {
          cartocss = cartocss + sprintf('#%s {polygon-fill: %s;}', indicator.id, this.options.colors[0]);

          _.each(this.options.colors, function(color, index) {
            var step = indicator.full - ((index + 1) * indicator.full / 8);

            if (indicator.full < 0) {
              cartocss = cartocss + sprintf('#%s [%s >= %s] {polygon-fill: %s;}', indicator.id, self.currentData, step, self.options.colors[index]);
            } else if (indicator.full > 0) {
              cartocss = cartocss + sprintf('#%s [%s <= %s] {polygon-fill: %s;}', indicator.id, self.currentData, step, self.options.colors[index]);
            }
          });

        } else {
          _.each(this.options.colors, function(color, index) {
            var step =  100 - ((index + 1) * 100 / 8);
            cartocss = cartocss + sprintf('#%s [%s <= %s] {polygon-fill: %s;}', indicator.id, self.currentData, step, self.options.neutralcolors[index]);
          });
        }

      } else {
        cartocss = cartocss + sprintf(' #%s {polygon-fill: %s;}', indicator.id, self.options.abscolors[0]);
        _.each(this.options.abscolors, function(color, index) {
          var step = (self.currentMin + (((self.currentMax - self.currentMin) * (self.options.abscolors.length - index - 1)) / self.options.abscolors.length)).toFixed(0);
          cartocss = cartocss + sprintf(' #%s [current <= %s] {polygon-fill: %s;}', indicator.id, step, self.options.abscolors[index]);
        });
      }

      cartocss = cartocss + sprintf(' #%s [current = null] {polygon-fill: #777;}', indicator.id);

      return cartocss;
    },

    setLegend: function() {
      var indicator, period;

      indicator = this.indicator.toJSON();
      period = this.filter.get('period');

      if (period !== 'latest') {
        if (indicator.full !== 0 && indicator.displayValue !== '-') {
          this.currentLegend = new cdb.geo.ui.Legend({
            type: 'custom',
            data: {},
            template: _.template('<ul><li class="graph"><div class="colors historical"></div></li><li class="max"><%= right %></li><li class="min"><%= left %></li><li class="center">0</li></ul>', {
              left: (indicator.full < 0) ? Math.abs(indicator.full - (2 * indicator.full / 8)) : Math.abs(indicator.full - (2 * indicator.full / 8)) * -1,
              right: (indicator.full < 0) ? Math.abs(indicator.full - ((this.options.colors.length - 1) * indicator.full / 8)) * -1: Math.abs(indicator.full - ((this.options.colors.length - 1) * indicator.full / 8))
            })
          });
        } else {
          // Neutral
          var left, right;

          if (indicator.neutral === 0) {
            left  = (indicator.full < 0) ? Math.abs(indicator.full - (2 * indicator.full / 8)) : Math.abs(indicator.full - (2 * indicator.full / 8)) * -1;
            right = (indicator.full < 0) ? Math.abs(indicator.full - ((this.options.neutralcolors.length - 2) * indicator.full / 8)) * -1: Math.abs(indicator.full - ((this.options.neutralcolors.length - 2) * indicator.full / 8));
          } else {
            left = -indicator.neutral;
            right = indicator.neutral;
          }

          this.currentLegend = new cdb.geo.ui.Legend({
            type: 'custom',
            data: {},
            template: _.template('<ul><li class="graph"><div class="colors neutral"></div></li><li class="max"><%= right %></li><li class="min"><%= left %></li><li class="center">0</li></ul>', {
              left: left,
              right: right
            })
          });
        }
      } else {
        this.currentLegend = new cdb.geo.ui.Legend({
          type: 'custom',
          data: {},
          template: _.template('<ul><li class="graph"><div class="colors non-historical"></div></li><li class="max"><%= right %></li><li class="min"><%= left %></li></ul>', {
            left: this.currentMin.toFixed(0),
            right: this.currentMax.toFixed(0)
          })
        });
      }

      this.$el.append(this.currentLegend.render().el);
    },

    setInfowindow: function() {
      var period, indicator, interactivity, template;

      if (!this.currentLayer) {
        return false;
      }

      if (this.infowindow) {
        this.infowindow.remove();
      }

      period = this.filter.get('period');
      indicator = this.indicator.toJSON();
      interactivity = (period !== 'latest' && indicator.historicalGeo) ? 'name, last_monthdayyear, last_fytd, last_year_previous, current, previous, previous_fytd, current_fytd' : 'name, current';

      if (period === 'latest') {
        template = sprintf(infowindowTpl, indicator.displayUnits, indicator.currentDate);
      } else {
        template = sprintf(infowindowHistoricalTpl, indicator.displayUnits, indicator.currentDate, indicator.previousDate);
      }

      this.infowindow = cdb.vis.Vis.addInfowindow(this.map, this.currentLayer.getSubLayer(0), interactivity, {
        infowindowTemplate: template,
        cursorInteraction: false,
        templateType: 'handlebars'
      });
    },

    show: function(id) {
      this.currentId = id;
      this.$el.addClass('is-active');
      Backbone.Events.trigger('map:done', id);

      if (this.currentLayer) {
        this.map.removeLayer(this.currentLayer);
        this.currentLayer = null;
      }

      this.setIndicator();
    },

    hide: function(e) {
      if (e) {
        e.stopPropagation();
        e.stopImmediatePropagation();
      }

      if (this.currentLayer) {
        this.map.removeLayer(this.currentLayer);
        this.currentLayer = null;
      }

      this.$el.removeClass('is-active');
      Backbone.Events.trigger('notify:hide');
      Backbone.Events.trigger('filter:close');


      if (this.filter.get('period') === 'latest') {
        this.filter.set('period', 'fytd');
      }

      Backbone.Events.trigger('map:closed');

      return false;
    }

  });

  return MapView;

});
