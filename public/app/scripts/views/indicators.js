'use strict';

define([
  'underscore',
  'backbone',
  'handlebars',
  'models/filter',
  'collections/indicators',
  'text!../../templates/indicators.handlebars'
], function(_, Backbone, Handlebars, filterModel, IndicatorsCollection, tpl) {

  var IndicatorsView = Backbone.View.extend({

    el: '#indicatorsView',

    events: {
      'click .mod-indicators-agency': 'filterByAgency'
    },

    template: Handlebars.compile(tpl),

    initialize: function() {
      var self = this;

      this.filter = filterModel;
      this.indicators = new IndicatorsCollection();

      this.indicators.getData(function(err) {
        if (err) {
          throw err.responseText;
        } else {
          self.render();
        }
      });

      this.filter.on('change:period', this.changePeriod, this);
    },

    render: function() {
      this.$el.html(this.template({
        indicators: this.indicators.toJSON()
      }));

      this.changePeriod();
    },

    filterByAgency: function(e) {
      var value = $(e.currentTarget).data('agency');
      this.filter.set('agency', value);
      e.preventDefault();
    },

    changePeriod: function() {
      var self, elements;

      self = this;
      elements = this.$el.find('.mod-indicators-value');

      elements.addClass('is-hidden');
      _.each(elements, function(el) {
        var $el = $(el);
        if ($el.data('period') === self.filter.get('period')) {
          $el.removeClass('is-hidden');
        }
      });
    }

  });

  return IndicatorsView;

});
