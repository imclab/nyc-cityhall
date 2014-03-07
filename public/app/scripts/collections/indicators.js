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
      this.data = data.rows;
      return this.getDataByFilters();
    },

    getDataByFilters: function() {
      var self, result;

      self = this;

      if (!this.data) {
        return [];
      }

      result = _.map(this.data, function(row) {
        var indicator = {
          id: row.indicator_id,
          agency: row.agency,
          frequency: row.frequency,
          name: row.indicator_name,
          currentDate: moment(row.date).format('MMM. YYYY'),
          currentValue: row.current_fytd,
          previousDate: moment(row.date).subtract('years', 1).format('MMM. YYYY'),
          previousValue: row.previous_fytd,
          full: row.full_green_percent,
          type: row.measure_type,
          date: row.date,
          geoType1: row.geo_type1,
          geoType2: row.geo_type2
        };

        switch(self.filter.get('period')) {
        case 'fytd':
          if (row.recording_units === 'value') {
            indicator.value = (-100 * (1.0 - (row.current_fytd / row.previous_fytd))).toFixed(1) + '%';
          } else if(row.recording_units === 'percent') {
            indicator.value = (row.current_fytd - row.previous_fytd).toFixed(1) + '%';
          }
          indicator.currentValue = row.current_fytd;
          indicator.previousValue = row.previous_fytd;
          indicator.currentDate = 'FYTD '+moment(row.date).format('YYYY');
          indicator.previousDate = 'FYTD '+(moment(row.date).format('YYYY')-1);
          break;
        case 'lastyear':
          if (row.recording_units === 'value') {
            indicator.value = (-100 * (1.0 - (row.current / row.previous_year_period))).toFixed(1) + '%';
          } else if(row.recording_units === 'percent') {
            indicator.value = (row.current - row.previous_year_period).toFixed(1) + '%';
          }
          indicator.currentValue = row.current;
          indicator.previousValue = row.previous_year_period;
          switch (row.frequency){
            case 'monthly':
              indicator.currentDate = moment(row.date).format('MMM, YYYY');
              indicator.previousDate = moment(row.date).subtract('months', 1).format('MMM')+','+moment(row.date).format('YYYY');
              break;
            case 'weekly':
              indicator.currentDate = 'Week '+moment(row.date).format('WW, YYYY');
              indicator.previousDate = 'Week '+moment(row.date).format('WW')+','+(moment(row.date).format('YYYY')-1);
              break;
            case 'daily':
              indicator.currentDate = moment(row.date).format('MM/DD/YYYY');
              indicator.previousDate = moment(row.date).format('MM')+'/'+moment(row.date).format('DD')+'/'+(moment(row.date).format('YYYY')-1);
              break;
          }
          break;
        case 'mmddyy':
          if (row.recording_units === 'value') {
            indicator.value = (-100 * (1.0 - (row.current / row.previous))).toFixed(1) + '%';
          } else if(row.recording_units === 'percent') {
            indicator.value = (row.current - row.previous).toFixed(1) + '%';
          }
          indicator.currentValue = row.current;
          indicator.previousValue = row.previous;
          switch (row.frequency){
            case 'monthly':
              indicator.currentDate = moment(row.date).format('MMM, YYYY');
              indicator.previousDate = moment(row.date).subtract('months', 1).format('MMM')+','+moment(row.date).format('YYYY');
              break;
            case 'weekly':
              indicator.currentDate = 'Week '+moment(row.date).format('WW, YYYY');
              indicator.previousDate = 'Week '+moment(row.date).format('WW')+','+(moment(row.date).format('YYYY')-1);
              break;
            case 'daily':
              indicator.currentDate = moment(row.date).format('MM/DD/YYYY');
              indicator.previousDate = moment(row.date).format('MM')+'/'+moment(row.date).format('DD')+'/'+(moment(row.date).format('YYYY')-1);
              break;
          }
          break;
        }

        if (row.recording_units === 'percent') {
          indicator.currentValue = indicator.currentValue + '%';
          indicator.previousValue = indicator.previousValue + '%';
        }

        return indicator;
      });

      return result;
    },

    getData: function(callback) {

      var query = sprintf('select * FROM data_overview(\'%s\', \'%s\')', window.sessionStorage.getItem('token'), moment().format());

      function onError(collection, err) {
        if (callback  && typeof callback === 'function') {
          callback(err);
        }
      }

      function onSuccess(collection) {
        if (callback  && typeof callback === 'function') {
          callback(undefined, collection);
          Backbone.Events.trigger('indicators:loaded', collection.toJSON());
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
