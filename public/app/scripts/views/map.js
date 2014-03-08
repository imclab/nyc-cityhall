'use strict';

define([
  'underscore',
  'backbone',
  'handlebars',
  'sprintf',
  'moment',
  'cartodb',
  'models/filter',
  'models/indicator',
  'text!../../templates/infowindow.mustache'
], function(_, Backbone, Handlebars, sprintf, moment, cartodbLib, filterModel, IndicatorModel, tpl) {

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
        //url: 'https://{s}.tiles.mapbox.com/v3/d4weed.hf61abb1/{z}/{x}/{y}.png',
        url: 'images/assets/blanktile.png',
        attribution: 'Mapbox'
      },
      cartodb: {
        user_name: 'nyc-cityhall',
        type: 'cartodb'
      },
      colors: ['#088246', '#379d4e', '#66b757', '#95d25f', '#b1de79', '#cce994', '#e8f5ae', '#fff8c3', '#fddc9f', '#fbbe79', '#faa052', '#f8822c', '#ef632b', '#e7452b', '#de262a'],
      abscolors:['#344a5f','#4e647a','#687d94','#8397af','#9db0ca','#b7c9e4','#d1e3ff',]
    },

    events: function() {
      if ('ontouchstart' in window) {
        return {
          'tap .icon-back': 'hide'
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

      this.indicator.on('change', this.changeVisualization, this);
      this.filter.on('change', this.changeVisualization, this);
      Backbone.Events.on('map:open', this.show, this);
    },

    setMap: function() {
      this.map = L.map(this.options.canvas, this.options.map);

      L.tileLayer(this.options.tiles.url, {
        attribution: this.options.tiles.attribution
      }).addTo(this.map);
    },

    changeVisualization: function() {
      if (!this.$el.hasClass('is-active')) {
        return false;
      }

      Backbone.Events.trigger('spinner:start');

      var self, indicator, sql, cartocss, options;

      self = this;
      indicator = this.indicator.toJSON();

      if (this.currentLayer) {
        this.map.removeLayer(this.currentLayer);
      }

      if (this.infowindow) {
        this.infowindow._closeInfowindow();
      }

      Backbone.Events.trigger('map:changed', indicator);

      sql = sprintf('WITH indicator AS (SELECT * FROM get_agg_geo(\'%1$s\',\'%2$s\',\'%3$s\',\'%4$s\',\'%5$s\')) SELECT g.cartodb_id, g.the_geom, g.geo_id, g.name, g.the_geom_webmercator, i.current, i.previous, CASE WHEN i.previous <> 0 THEN 100*(i.current - i.previous)/i.previous ELSE null END as last_monthdayyear FROM %2$s g LEFT OUTER JOIN indicator i ON (g.geo_id = i.geo_id)', indicator.id, indicator.geoType1, indicator.date, window.sessionStorage.getItem('token'), moment().format());

      cartocss = sprintf('#%s {polygon-fill: #777; line-color: #292929;  line-width: 2; polygon-opacity: 1; }', indicator.id);
      cartocss = cartocss + '[ last_monthdayyear != null]{ ';
      _.each(this.options.colors, function(color, index) {
        var step = indicator.full - ((index + 1) * indicator.full / 8);
        if (indicator.full < 0) {
          index = self.options.colors.length - (index + 1);
        } else {
          index = 7;
        }
        cartocss = cartocss + sprintf('#%s [last_monthdayyear <= %s] {polygon-fill: %s;}', indicator.id, step, self.options.colors[index]);
      });
      cartocss = cartocss + '} ';
      cartocss = cartocss + '[ last_monthdayyear = null]{ ';
      _.each(this.options.abscolors, function(color, index) {
        var step = 100 - ((index + 1) * 100 / 8);
        index = self.options.abscolors.length - (index + 1);
        cartocss = cartocss + sprintf(' #%s [current <= %s] {polygon-fill: %s;}', indicator.id, step, self.options.abscolors[index]);
      });
      cartocss = cartocss + '} ';

      cartocss = cartocss + sprintf(' #%s [current = null] {polygon-fill: #777;}', indicator.id);

      options = _.extend({}, this.options.cartodb, {
        interactivity: 'name, current',
        sublayers: [{
          sql: sql,
          cartocss: cartocss
        }]
      });

      function addLayerToMap(layer) {
        var sublayer = layer.getSubLayer(0);

        self.currentLayer = layer;
        self.infowindow = cdb.vis.Vis.addInfowindow(self.map, sublayer, options.interactivity, {
          infowindowTemplate: self.template,
          cursorInteraction: false
        });

        sublayer.setInteraction(true);
        self.map.setView(self.options.map.center, self.options.map.zoom);
        self.map.addLayer(layer);

        Backbone.Events.trigger('spinner:stop');
      }

      _.delay(function() {
        cartodb.createLayer(self.map, options, {https: true}).done(addLayerToMap);
      }, 301);
    },

    show: function(indicator) {
      this.$el.addClass('is-active');
      this.indicator.set(indicator);
      this.map.invalidateSize();
    },

    hide: function() {
      this.$el.removeClass('is-active');
    }

  });

  return MapView;

});
