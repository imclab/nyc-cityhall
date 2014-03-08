'use strict';

define([
  'backbone',
  'handlebars',
  'models/indicator',
  'text!../../../templates/indicator-map.handlebars'
], function(Backbone, Handlebars, IndicatorModel, tpl) {

  var MapIndicatorView = Backbone.View.extend({

    el: '#mapIndicatorView',

    template: Handlebars.compile(tpl),

    initialize: function() {
      this.indicator = new IndicatorModel();

      Backbone.Events.on('map:changed', this.changeData, this);
    },

    render: function() {
      this.$el.html(this.template(this.indicator.toJSON()));
    },

    changeData: function(data) {
      this.indicator.set(data);
      this.render();
    }

  });

  return MapIndicatorView;

});
