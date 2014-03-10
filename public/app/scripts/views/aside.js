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
          'touchstart .icon-close': 'close',
          'touchstart .mod-aside-agencies a': 'changeAgency',
          'touchstart .mod-aside-types a': 'changeIndicatorType'
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

      console.log(indicators);

      dataAgencies = _.uniq(_.pluck(indicators, 'agency'));
      dataTypes = _.uniq(_.pluck(indicators, 'type'));
      agencies = _.map(dataAgencies, function(agency) {
        return {
          name: agency
        };
      });
      types = _.map(dataTypes, function(type) {
        return {
          slug: type,
          name: (type === 'basic_services') ? 'Basic services' : 'Equality measure'
        };
      });

      this.agencies.add(agencies);
      this.types.add(types);

      this.render();
      this.show();
    },

    changeAgency: function(e) {
      var current = $(e.currentTarget);
      this.$el.find('.mod-aside-agencies a').removeClass('current');
      this.$el.find('.mod-aside-types a').removeClass('current');
      this.$el.find('.mod-aside-types a[data-type="all"]').addClass('current');
      this.filter.set('agency', current.data('agency'));
      current.addClass('current');
      e.preventDefault();
    },

    changeIndicatorType: function(e) {
      var current = $(e.currentTarget);
      this.$el.find('.mod-aside-types a').removeClass('current');
      this.$el.find('.mod-aside-agencies a').removeClass('current');
      this.$el.find('.mod-aside-agencies a[data-agency="all"]').addClass('current');
      this.filter.set('type', current.data('type'));
      current.addClass('current');
      e.preventDefault();
    },

    show: function() {
      this.$el.addClass('is-active');
    },

    close: function() {
      Backbone.Events.trigger('application:toggle');
    }

  });

  return AsideView;

});
