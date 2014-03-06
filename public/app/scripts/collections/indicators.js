'use strict';

define([
  'underscore',
  'backbone',
  'moment',
  'sprintf',
  'models/filter',
  'models/indicator'
], function(_, Backbone, moment, sprintf, filterModel, IndicatorModel) {

  var IndicatorsCollection = Backbone.Collection.extend({

    model: IndicatorModel,

    url: 'http://nyc-cityhall.cartodb.com/api/v2/sql',

    initialize: function() {
      this.filter = filterModel.instance;
    },

    parse: function(data) {
      var self, result;

      self = this;
      result = _.map(data.rows, function(row) {
        var indicator = {
          agency: row.agency,
          frequency: row.frequency,
          name: row.indicator_name,
          currentDate: moment(row.date).format('MMM. YYYY'),
          currentValue: row.current_fytd,
          previousDate: moment(row.date).subtract('years', 1).format('MMM. YYYY'),
          previousValue: row.previous_fytd
        };

        switch(self.filter.get('period')) {
        case 'fytd':
          indicator.value = (100 * (1.0 - (row.current_fytd / row.previous_fytd))).toFixed(1) + '%';
          break;
        case 'lastyear':
          indicator.value = (100 * (1.0 - (row.current / row.previous_year_period))).toFixed(1) + '%';
          break;
        case 'mmddyy':
          indicator.value = (100 * (1.0 - (row.current / row.previous))).toFixed(1) + '%';
          break;
        }

        if (row.recording_units === 'percent') {
          indicator.currentValue = indicator.currentValue + '%';
          indicator.previousValue = indicator.previousValue + '%';
        }

        console.log(indicator);

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
