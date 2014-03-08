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
  'text!../../templates/indicators.handlebars'
], function(_, Backbone, Handlebars, sprintf, moment, cartodbLib, filterModel, IndicatorModel, tpl) {

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
        url: 'https://{s}.tiles.mapbox.com/v3/d4weed.hf61abb1/{z}/{x}/{y}.png',
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
          'tap .icon-close': 'close'
        };
      }

      return {
        'click .icon-close': 'close'
      };
    },

    template: Handlebars.compile(tpl),

    initialize: function() {
      this.indicator = new IndicatorModel();
      this.filter = filterModel.instance;
      this.$indicator = $('#indicator');

      this.setMap();

      this.indicator.on('change', this.changeVisualization, this);
      this.filter.on('change', this.changeVisualization, this);
      Backbone.Events.on('map:open', this.open, this);
    },

    render: function() {
      this.$indicator.html('hola');
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

      sql = sprintf('WITH indicator AS (SELECT * FROM get_agg_geo(\'%1$s\',\'%2$s\',\'%3$s\',\'%4$s\',\'%5$s\')) SELECT g.cartodb_id, g.the_geom, g.geo_id, g.name, g.the_geom_webmercator, i.current, i.previous, CASE WHEN i.previous <> 0 THEN 100*(i.current - i.previous)/i.previous ELSE null END as last_monthdayyear FROM %2$s g LEFT OUTER JOIN indicator i ON (g.geo_id = i.geo_id)', indicator.id, indicator.geoType1, indicator.date, window.sessionStorage.getItem('token'), moment().format());

      cartocss = sprintf('#%s {polygon-fill: #777; line-color: #000; polygon-opacity: 0.8; }', indicator.id);
      cartocss=cartocss+'[ last_monthdayyear != null]{ ';
      _.each(this.options.colors, function(color, index) {
        var step = indicator.full - ((index + 1) * indicator.full / 8);
        if (indicator.full < 0) {
          index = self.options.colors.length - (index+1);
        } else {
          index = 7;
        }
        cartocss = cartocss + sprintf('#%s [last_monthdayyear <= %s] {polygon-fill: %s;}', indicator.id, step, self.options.colors[index]);
      });
      cartocss=cartocss+'} ';
      cartocss=cartocss+'[ last_monthdayyear = null]{ ';
      _.each(this.options.abscolors, function(color, index) {
        var step = 100 - ((index + 1) * 100/ 8);
        index = self.options.abscolors.length - (index+1);
        cartocss = cartocss + sprintf(' #%s [current <= %s] {polygon-fill: %s;}', indicator.id, step, self.options.abscolors[index]);
      });
      cartocss=cartocss+'} ';

      cartocss = cartocss + sprintf(' #%s [current = null] {polygon-fill: #777;}', indicator.id);
      //console.log(sql);
      //console.log(cartocss);
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

      cartodb.createLayer(this.map, options, {https: true}).done(onDone);
    },

    open: function(indicator) {
      this.$el.addClass('is-active');
      this.indicator.set(indicator);
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
