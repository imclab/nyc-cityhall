'use strict';

define([
  'underscore',
  'backbone',
  'handlebars',
  'collections/indicators-types',
  'collections/agencies',
  'text!../../templates/aside.handlebars'
], function(_, Backbone, Handlebars, IndicatorsTypesCollection, AgenciesCollections, tpl) {

  var AsideView = Backbone.View.extend({

    el: '#asideView',

    template: Handlebars.compile(tpl),

    initialize: function() {
      this.agencies = new AgenciesCollections();
      this.types = new IndicatorsTypesCollection();

      Backbone.Events.once('indicators:loaded', this.setDataCollections, this);
    },

    render: function() {
      var self = this;

      this.$el.html(this.template({
        agencies: this.agencies.toJSON(),
        types: this.types.toJSON()
      }));
    },

    setDataCollections: function(indicators) {
      var dataAgencies, dataTypes, agencies, types;

      dataAgencies = _.uniq(_.pluck(indicators, 'agency'));
      dataTypes = _.uniq(_.pluck(indicators, 'type'));
      agencies = _.map(dataAgencies, function(agency) {
        return {
          name: agency
        };
      });
      types = _.map(dataTypes, function(type) {
        return {
          name: type
        };
      });

      this.agencies.add(agencies);
      this.types.add(types);

      this.render();
    }

  });

  return AsideView;

});
