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

    url: 'https://nyc-cityhall.cartodb.com/api/v2/sql',

    colors: ['#088246', '#379d4e', '#66b757', '#95d25f', '#b1de79', '#cce994', '#e8f5ae', '#fff8c3', '#fddc9f', '#fbbe79', '#faa052', '#f8822c', '#ef632b', '#e7452b', '#de262a'],

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
          currentDate: moment(row.date).format('MMM, YYYY'),
          currentValue: row.current_fytd,
          previousDate: moment(row.date).subtract('years', 1).format('MMM, YYYY'),
          previousValue: row.previous_fytd,
          full: row.full_green_percent,
          neutral: row.neutral_full_green,
          type: row.measure_t,
          date: row.date,
          geoType1: row.geog_type1,
          geoType2: row.geog_type2,
          historicalGeo: row.has_historical_geo,
          zeroTolerance: row.zero_tolerance,
          displayUnits: row.display_units,
          defaultOrder: row.default_order
        };

        switch(self.filter.get('period')) {
        case 'fytd':
          if (row.recording_units === 'value') {
            indicator.value = (-100 * (1.0 - (row.current_fytd / row.previous_fytd))).toFixed(1);
          } else if(row.recording_units === 'percent') {
            indicator.value = (row.current_fytd - row.previous_fytd).toFixed(1) ;
            if(row.current_fytd===null || row.previous_fytd===null){
              indicator.value =1/0;
            }
          }
          if(row.current_fytd===0 && row.previous_fytd===0){
            indicator.value =0;
          }
          indicator.currentValue = row.current_fytd;
          indicator.previousValue = row.previous_fytd;
          if (row.ytd_type === 'c') {
            indicator.currentDate = 'CYTD '+moment(row.date).format('YYYY');
            indicator.previousDate = 'CYTD '+(moment(row.date).format('YYYY')-1);
          } else {
            indicator.currentDate = 'FYTD '+moment(row.date).format('YYYY');
            indicator.previousDate = 'FYTD '+(moment(row.date).format('YYYY')-1);
          }

          break;
        case 'lastyear':
          if (row.recording_units === 'value') {
            indicator.value = (-100 * (1.0 - (row.current / row.previous_year_period))).toFixed(1);
          } else if(row.recording_units === 'percent') {
            indicator.value = (row.current - row.previous_year_period).toFixed(1);
            if(row.current===null || row.previous_year_period===null){
              indicator.value =1/0;
            }
          }
          if(row.current===0 && row.previous_year_period===0){
            indicator.value =0;
          }
          indicator.currentValue = row.current;
          indicator.previousValue = row.previous_year_period;
          switch (row.frequency) {
            case 'monthly':
              indicator.currentDate = moment(row.date).format('MMM, YYYY');
              indicator.previousDate = moment(row.date).subtract('years', 1).format('MMM, YYYY');
              break;
            case 'weekly':
              indicator.currentDate = 'Week ' + moment(row.date).format('WW, YYYY');
              indicator.previousDate = 'Week ' + moment(row.date).subtract('years', 1).format('WW, YYYY');
              break;
            case 'daily':
              indicator.currentDate = moment(row.date).format('MM/DD/YYYY');
              indicator.previousDate = moment(row.date).subtract('years', 1).format('MM/DD/YYYY');
              break;
          }
          break;
        case 'mmwwdd':
          if (row.recording_units === 'value') {
            indicator.value = (-100 * (1.0 - (row.current / row.previous))).toFixed(1);
          } else if (row.recording_units === 'percent') {
            indicator.value = (row.current - row.previous).toFixed(1);
            if(row.current===null || row.previous===null){
              indicator.value =1/0;
            }
          }
          if(row.current===0 && row.previous===0){
            indicator.value =0;
          }
          indicator.currentValue = row.current;
          indicator.previousValue = row.previous;
          switch (row.frequency) {
            case 'monthly':
              indicator.currentDate = moment(row.date).format('MMM, YYYY');
              indicator.previousDate = moment(row.date).subtract('months', 1).format('MMM, YYYY');
              break;
            case 'weekly':
              indicator.currentDate = 'Week ' + moment(row.date).format('WW, YYYY');
              indicator.previousDate = 'Week ' + moment(row.date).subtract('weeks', 1).format('WW, YYYY');
              break;
            case 'daily':
              indicator.currentDate = moment(row.date).format('MM/DD/YYYY');
              indicator.previousDate = moment(row.date).subtract('days', 1).format('MM/DD/YYYY');
              break;
          }
          break;
        }

        indicator.color = self.colors[0];

        _.each(self.colors, function(color, index) {
          var step = indicator.full - ((index + 1) * indicator.full / 8);
          if (indicator.full > 0) {
            if (indicator.value < step) {
              indicator.color = color;
            }
            if (indicator.zeroTolerance && indicator.value < 0) {
              indicator.color = self.colors[self.colors.length - 1];
            }
          } else if (indicator.full < 0) {
            if (indicator.value > step) {
              indicator.color = color;
            }
            if (indicator.zeroTolerance && indicator.value > 0) {
              indicator.color = self.colors[self.colors.length - 1];
            }
          } else {
            indicator.color = '#fff';
          }
        });

        if (indicator.value / indicator.full === 0) {
          indicator.color = self.colors[7];
        }

        //format for display
        if (indicator.value !== '0' && indicator.value[indicator.value.length -1] === '0') {
          indicator.value = indicator.value.substring(0, indicator.value.length -2);
        }
        indicator.displayValue = (indicator.value > 0) ? '+' + indicator.value + '%' : indicator.value + '%';

        indicator.displayCurrentValue = self.numberWithCommas(indicator.currentValue);
        indicator.displayPreviousValue = self.numberWithCommas(indicator.previousValue );

        if (indicator.displayCurrentValue === null) {
          indicator.displayCurrentValue = '-';
        }
        if (indicator.displayPreviousValue === null) {
          indicator.displayPreviousValue = '-';
        }

        if (row.recording_units === 'percent') {
          indicator.displayCurrentValue = indicator.displayCurrentValue + '%';
          indicator.displayPreviousValue = indicator.displayPreviousValue + '%';
        }

        if (!isFinite(indicator.value)) {
          indicator.value = 0;
          indicator.displayValue = '-';
          indicator.color = '#fff';
        }

        indicator.status = (indicator.value / indicator.full >= 0 || indicator.full === 0 || indicator.value === null || indicator.value === 0) ? 'improving' : 'worsening';
        indicator.urgent = (indicator.value / indicator.full <= -1 && indicator.full !== 0 && indicator.value !== null) ? 'true' : 'false';

        if (indicator.displayUnits === 'seconds' && indicator.displayCurrentValue !== '-') {
          indicator.displayCurrentValue = moment().hours(0).minutes(0).seconds(indicator.displayCurrentValue).format('HH:mm:ss');
        }

        if (indicator.displayUnits === 'seconds' && indicator.displayPreviousValue !== '-') {
          indicator.displayPreviousValue = moment().hours(0).minutes(0).seconds(indicator.displayPreviousValue).format('HH:mm:ss');
        }

        return _.extend({}, row, indicator);
      });

      return result;
    },

    numberWithCommas: function(num) {
      if (num === null) {
        return null;
      }
      if (num % 1 !== 0) {
        num = num.toFixed(2);
      }
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    },

    getData: function(callback) {

      var query = sprintf('select * FROM data_overview(\'%s\', \'%s\')', window.sessionStorage.getItem('token'), (moment().format('HH') / 4).toFixed(0));

      function onError(collection, err) {
        if (callback  && typeof callback === 'function') {
          callback(err);
          window.sessionStorage.removeItem('token');
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
        dataType: 'jsonp',
        success: onSuccess,
        error: onError
      });

    }

  });

  return {
    collection: IndicatorsCollection,
    instance: new IndicatorsCollection()
  };

});
