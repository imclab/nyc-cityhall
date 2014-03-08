'use strict';

define([
  'backbone',
  'models/indicator',
], function(Backbone, IndicatorModel) {

  var MapIndicatorView = Backbone.View.extend({

    el: '#mapIndicatorView',

    initialize: function() {
      this.indicator = new IndicatorModel();
    },

  });

  return MapIndicatorView;

});
