'use strict';

define([
  'backbone',
  'handlebars',
  'models/indicator',
  'collections/indicators',
  'models/filter',
  'text!../../../templates/indicator-map.handlebars'
], function(Backbone, Handlebars, IndicatorModel, indicatorsCollection, filterModel, tpl) {

  var MapIndicatorView = Backbone.View.extend({

    el: '#mapIndicatorView',

    template: Handlebars.compile(tpl),

    initialize: function() {
      this.indicator = new IndicatorModel();
      this.indicators = indicatorsCollection.instance;
      this.filter = filterModel.instance;

      this.filter.on('change:period', this.changeData, this);
      Backbone.Events.on('map:done', this.changeData, this);
    },

    render: function() {
      this.$el.html(this.template(this.indicator.toJSON()));
    },

    changeData: function(id) {
      var self = this;

      this.indicator.set('latest', false);

      if (this.filter.get('period') === 'latest') {
        this.indicator.set('color', '#b7c9e4');
        this.indicator.set('latest', true);
        this.render();
        return false;
      }

      if (id && typeof id === 'string') {
        this.currentId = id;
      }

      if (this.indicators.length > 0) {
        this.indicators.set(this.indicators.getDataByFilters(), {
          remove: true
        });
        this.indicator.set(this.indicators.get(this.currentId).toJSON());
        this.render();
      } else {
        this.indicators.getData(function() {
          self.indicator.set(self.indicators.get(self.currentId).toJSON());
          self.render();
        });
      }
    }

  });

  return MapIndicatorView;

});
