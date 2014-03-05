'use strict';

define([
  'underscore',
  'backbone',
  'sprintf',
  'models/indicator'
], function(_, Backbone, sprintf, IndicatorModel) {

  var IndicatorsCollection = Backbone.Collection.extend({

    model: IndicatorModel,

    url: 'http://nyc-cityhall.cartodb.com/api/v2/sql',

    parse: function(data) {
      var result = _.map(data.rows, function(row) {
        var indicator = {
          id: row.indicator_id,
          name: row.indicator_name,
          agency: row.agency,
          min: row.full_green_percent,
          max: -row.full_green_percent,
          daily: null,
          weekly: row.weekly_percent + '%',
          monthly: row.monthly_percent + '%',
          yearly: row.yearly_percent + '%'
        };

        if (row.year_ago_percent && row.yearly_percent) {
          indicator.year = row.year_ago_percent + row.yearly_percent + '%';
        }

        if (row.year_ago_percent) {
          indicator.yearAgo = row.year_ago_percent + '%';
        }

        return indicator;
      });

      return result;
    },

    getData: function(callback) {

      var query = sprintf('select * FROM data_overview(\'%s\')', window.sessionStorage.getItem('token'));

      function onError(collection, err) {
        if (callback  && typeof callback === 'function') {
          callback(err);
        }
      }

      function onSuccess(collection) {
        if (callback  && typeof callback === 'function') {
          callback(undefined, collection);
        }
      }

      this.fetch({
        data: {
          q: query,
          format: 'json'
        },
        success: onSuccess,
        error: onError
      });

    }

  });

  return IndicatorsCollection;

});
