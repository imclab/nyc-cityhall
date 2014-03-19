'use strict';

define([
  'underscore',
  'backbone',
  'handlebars',
  'sprintf',
  'moment',
  'models/filter',
  'models/indicator',
  'text!../../templates/infowindow.handlebars'
], function(_, Backbone, Handlebars, sprintf, moment, filterModel, IndicatorModel, tpl) {

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
      abscolors:['#344a5f','#4e647a','#687d94','#8397af','#9db0ca','#b7c9e4','#d1e3ff']
    },

    events: function() {
      if ('ontouchstart' in window) {
        return {
          'touchstart .icon-back': 'hide'
        };
      }

      return {
        'click .icon-back': 'hide'
      };
    },

    template: tpl,

    initialize: function() {
      this.indicator = new IndicatorModel();
      this.filter = filterModel.instance;

      this.setMap();
      this.setTiles();

      Backbone.Events.on('map:open', this.show, this);
      Backbone.Events.on('map:toggle', this.changeVisualization, this);
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

    changeVisualization: function(type) {
      var self, indicator, sql, cartocss, options, legendItems;

      self = this;
      legendItems = [];
      indicator = this.indicator.toJSON();

      if (!type) {
        type = 'history';
      }

      if (!this.$el.hasClass('is-active')) {
        return false;
      }

      Backbone.Events.trigger('map:changed', indicator);

      if (this.currentLayer) {
        this.map.removeLayer(this.currentLayer);
      }

      if (!this.indicator.get('historicalGeo')) {
        if (this.tiles) {
          this.map.removeLayer(this.tiles);
        }
        Backbone.Events.trigger('notify:show');
        return false;
      } else {
        this.setTiles();
      }

      Backbone.Events.trigger('spinner:start');

      if (this.infowindow) {
        this.infowindow._closeInfowindow();
      }

      sql = sprintf('WITH indicator AS (SELECT * FROM get_agg_geo(\'%1$s\',\'%2$s\',\'%3$s\',\'%4$s\',\'%5$s\')) SELECT g.cartodb_id, g.the_geom, g.geo_id, g.name, g.the_geom_webmercator, i.current, i.previous, CASE WHEN i.previous = 0 THEN sign(i.current) * 100 ELSE CASE WHEN i.previous IS NOT NULL THEN trunc(100*(i.current - i.previous)/i.previous, 1) ELSE null END END as last_monthdayyear FROM %2$s g LEFT OUTER JOIN indicator i ON (g.geo_id = i.geo_id)', indicator.id, indicator.geoType1, indicator.date, window.sessionStorage.getItem('token'), moment().format());

      cartocss = sprintf('#%s {polygon-fill: #777; line-color: #292929;  line-width: 1; polygon-opacity: 0.7; }', indicator.id);
      if (indicator.historicalGeo && type==='history') {

        _.each(this.options.colors, function(color, index) {

          var step = indicator.full - ((index + 1) * indicator.full / 8);

          if (indicator.full !== 0) {
            legendItems.push({
              name: step.toString(),
              value: self.options.colors[index]
            });
          } else {
            legendItems[0] = {
              name: 'NEUTRAL',
              value: '#ffffff'
            };
          }

          if (indicator.full < 0) {
            cartocss = cartocss + sprintf('#%s {polygon-fill: %s; line-color: #292929; }', indicator.id, self.options.colors[0]);
            cartocss = cartocss + sprintf('#%s [last_monthdayyear >= %s] {polygon-fill: %s;}', indicator.id, step, self.options.colors[index]);
          } else if (indicator.full > 0) {
            cartocss = cartocss + sprintf('#%s {polygon-fill: %s; line-color: #292929;  }', indicator.id, self.options.colors[0]);
            cartocss = cartocss + sprintf('#%s [last_monthdayyear <= %s] {polygon-fill: %s;}', indicator.id, step, self.options.colors[index]);
          } else {
            cartocss = cartocss + sprintf('#%s {polygon-fill: %s; line-color: #292929;  }', indicator.id, '#ffffff');
          }
        });
      } else {
        _.each(this.options.abscolors, function(color, index) {
          var step = 100 - ((index + 1) * 100 / 8);

          legendItems.push({
            name: step.toString(),
            value: color
          });

          cartocss = cartocss + sprintf(' #%s {polygon-fill: %s; line-color: #292929; }', indicator.id, self.options.abscolors[0]);
          cartocss = cartocss + sprintf(' #%s [current <= %s] {polygon-fill: %s;}', indicator.id, step, self.options.abscolors[index]);
        });
      }

      cartocss = cartocss + sprintf(' #%s [current = null] {polygon-fill: #777;}', indicator.id);

      if (this.currentLegend) {
        $(this.currentLegend.render().el).remove();
      }
      this.currentLegend = new cdb.geo.ui.Legend({
        type: 'custom',
        data: legendItems
      });

      options = _.extend({}, this.options.cartodb, {
        interactivity: (this.indicator.get('historicalGeo')) ? 'name, last_monthdayyear, current, previous' : 'name, current',
        sublayers: [{
          sql: sql,
          cartocss: cartocss
        }]
      });

      function addLayerToMap(layer) {
        var sublayer = layer.getSubLayer(0);

        self.currentLayer = layer;
        self.infowindow = cdb.vis.Vis.addInfowindow(self.map, sublayer, options.interactivity, {
          infowindowTemplate: sprintf(self.template, indicator.displayUnits),
          cursorInteraction: false,
          templateType: 'handlebars'
        });

        sublayer.setInteraction(true);
        self.map.setView(self.options.map.center, self.options.map.zoom);
        self.map.addLayer(layer);
        self.$el.append(self.currentLegend.render().el);

        Backbone.Events.trigger('spinner:stop');
      }

      _.delay(function() {
        cartodb.createLayer(self.map, options, {https: true})
          .on('done', addLayerToMap)
          .on('error', function(err) {
            throw err;
          });
      }, 301);
    },

    show: function(indicator) {
      this.$el.addClass('is-active');
      this.indicator.set(indicator);
      Backbone.Events.trigger('map:done', indicator);
      this.map.invalidateSize();
    },

    hide: function(e) {
      if (e) {
        e.stopPropagation();
        e.stopImmediatePropagation();
      }

      Backbone.Events.trigger('notify:hide');
      this.$el.removeClass('is-active');

      return false;
    }

  });

  return MapView;

});
