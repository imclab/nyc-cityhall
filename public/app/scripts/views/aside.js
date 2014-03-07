'use strict';

define([
  'underscore',
  'backbone',
  'handlebars',
  'models/filter',
  'collections/indicators-types',
  'collections/agencies',
  'text!../../templates/aside.handlebars'
], function(_, Backbone, Handlebars, filterModel, IndicatorsTypesCollection, AgenciesCollections, tpl) {

  var AsideView = Backbone.View.extend({

    el: '#asideView',

    events: function() {

      if ('ontouchstart' in window) {
        return {
          'tap .icon-close': 'close',
          'tap .mod-aside-agencies a': 'changeAgency',
          'tap .mod-aside-types a': 'changeIndicatorType'
        };
      }

      return {
        'click .icon-close': 'close',
        'click .mod-aside-agencies a': 'changeAgency',
        'click .mod-aside-types a': 'changeIndicatorType'
      };
    },

    template: Handlebars.compile(tpl),

    initialize: function() {
      this.filter = filterModel.instance;
      this.agencies = new AgenciesCollections();
      this.types = new IndicatorsTypesCollection();

      Backbone.Events.once('indicators:loaded', this.setDataCollections, this);
    },

    render: function() {
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
    },

    changeAgency: function(e) {
      e.preventDefault();
      this.filter.set('agency', $(e.currentTarget).data('agency'));
    },

    changeIndicatorType: function(e) {
      e.preventDefault();
    },

    close: function() {
      Backbone.Events.trigger('application:toggle');
    }

  });

  return AsideView;

});
