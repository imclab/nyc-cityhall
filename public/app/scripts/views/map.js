'use strict';

define([
  'underscore',
  'backbone',
  'sprintf',
  'moment',
  'cartodb',
  'models/filter',
  'models/indicator'
], function(_, Backbone, sprintf, moment, cartodbLib, filterModel, IndicatorModel) {

  var MapView = Backbone.View.extend({

    el: '#mapView',

    options: {
      canvas: 'map',
      map: {
        zoomControl: false,
        center: [40.7, -74],
        zoom: 11
      },
      tiles: {
        url: 'http://tile.stamen.com/toner/{z}/{x}/{y}.png',
        attribution: 'Stamen'
      },
      cartodb: {
        user_name: 'nyc-cityhall',
        type: 'cartodb'
      },
      colors: ['#088246', '#379d4e', '#66b757', '#95d25f', '#b1de79', '#cce994', '#e8f5ae', '#fff8c3', '#fddc9f', '#fbbe79', '#faa052', '#f8822c', '#ef632b', '#e7452b', '#de262a']
    },

    events: function() {
      if ('ontouchstart' in window) {
        return {
          'tap .icon-close': 'close'
        };
      }

      return {
        'click .icon-close': 'close'
      };
    },

    initialize: function() {
      this.indicator = new IndicatorModel();
      this.filter = filterModel.instance;
      this.setMap();

      this.indicator.on('change', this.changeVisualization, this);
      this.filter.on('change', this.changeVisualization, this);
      Backbone.Events.on('map:open', this.open, this);
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
      var self, indicator, sql, cartocss, options;

      self = this;
      indicator = this.indicator.toJSON();

      sql = sprintf('WITH indicator AS (SELECT * FROM get_agg_geo(\'%1$s\',\'%2$s\',\'%3$s\',\'%4$s\',\'%5$s\')) SELECT g.cartodb_id, g.the_geom, g.geo_id, g.name, g.the_geom_webmercator, i.value, i.percent_change FROM %2$s g LEFT OUTER JOIN indicator i ON (g.geo_id = i.geo_id)', indicator.id, indicator.geoType1, indicator.date, window.sessionStorage.getItem('token'), moment().format());

      cartocss = sprintf('#%s {polygon-fill: #FF0000; line-color: #000; polygon-opacity: 0.8; [value = null] {polygon-fill: #777;}}', indicator.id);

      _.each(this.options.colors, function(color, index) {
        var step = indicator.full - ((index + 1) * indicator.full / 8);
        if (indicator.full < 0) {
          index = colors.length - index;
        } else {
          index = 7;
        }
        cartocss = cartocss + sprintf(' #%s [percent_change <= %s] {polygon-fill: %s;}', indicator.id, step, colors[index]);
      });

      options = _.extend({}, this.options.cartodb, {
        sublayers: [{
          sql: sql,
          cartocss: cartocss
        }]
      });

      function onDone(layer) {
        if (self.currentLayer) {
          self.map.removeLayer(self.currentLayer);
        }
        self.currentLayer = layer;
        self.map.addLayer(layer);
      }

      cartodb.createLayer(this.map, options).done(onDone);
    },

    open: function(indicator) {
      this.indicator.set(indicator);
      this.$el.addClass('is-active');
      this.map.invalidateSize();
      Backbone.Events.trigger('map:opened');
    },

    close: function() {
      this.$el.removeClass('is-active');
      Backbone.Events.trigger('map:closed');
    }

  });

  return MapView;

});
