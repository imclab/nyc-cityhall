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
        //console.log(row);
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
          geoType1: row.geog_type1,
          geoType2: row.geog_type2
        };

        switch(self.filter.get('period')) {
        case 'fytd':
          if (row.recording_units === 'value') {
            indicator.value = (-100 * (1.0 - (row.current_fytd / row.previous_fytd))).toFixed(1);
          } else if(row.recording_units === 'percent') {
            indicator.value = (row.current_fytd - row.previous_fytd).toFixed(1) ;
          }
          indicator.currentValue = row.current_fytd;
          indicator.previousValue = row.previous_fytd;
          indicator.currentDate = 'FYTD '+moment(row.date).format('YYYY');
          indicator.previousDate = 'FYTD '+(moment(row.date).format('YYYY')-1);
          break;
        case 'lastyear':
          if (row.recording_units === 'value') {
            indicator.value = (-100 * (1.0 - (row.current / row.previous_year_period))).toFixed(1);
          } else if(row.recording_units === 'percent') {
            indicator.value = (row.current - row.previous_year_period).toFixed(1);
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
            indicator.value = (-100 * (1.0 - (row.current / row.previous))).toFixed(1) ;
          } else if(row.recording_units === 'percent') {
            indicator.value = (row.current - row.previous).toFixed(1) ;
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




        indicator.color = self.colors[0];

        _.each(self.colors, function(color, index) {
          var step = indicator.full - ((index + 1) * indicator.full / 8);
          if (indicator.full > 0) {
            if (indicator.value < step) {
              indicator.color = color;
            }
          } else if (indicator.full < 0) {
            if (indicator.value > step) {
              indicator.color = color;
            }

          } else {
            indicator.color = self.colors[7];
          }
          if (indicator.value === 0) {
            indicator.color = self.colors[7];
          }
        });



        //format for display
        indicator.displayValue=indicator.value+ '%';

        indicator.displayCurrentValue = self.numberWithCommas(indicator.currentValue);
        indicator.displayPreviousValue = self.numberWithCommas(indicator.previousValue );

        if (row.recording_units === 'percent') {
          indicator.displayCurrentValue = indicator.displayCurrentValue + '%';
          indicator.displayPreviousValue = indicator.displayPreviousValue + '%';
        }

        if(indicator.value==='Infinity' || indicator.value==='NaN'){
          indicator.value=0;
          indicator.full=0;
          indicator.displayValue='-';
          indicator.color='#fff';
        }

        indicator.status = (indicator.value/indicator.full>=0  || indicator.full===0  || indicator.value===null || indicator.value===0 )?'improving':'worsening';
        indicator.urgent = (indicator.value/indicator.full<=-1 && indicator.full!==0 && indicator.value!==null)?'true':'false';

        return indicator;
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
