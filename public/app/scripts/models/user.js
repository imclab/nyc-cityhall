'use strict';

define(['backbone', 'moment', 'sprintf'], function(Backbone, moment, sprintf) {

  var UserModel = Backbone.Model.extend({

    url: 'https://nyc-cityhall.cartodb.com/api/v2/sql',

    parse: function(data) {
      return data.rows[0];
    },

    check: function(username, password, callback) {
      var date, query;

      date = moment().add('hours', 4).format();

      query = sprintf('SELECT log_in(\'%s\',\'%s\',\'%s\') AS token', username, password, date);

      function onError(model, err) {
        if (callback && typeof callback === 'function') {
          callback(err);
          window.sessionStorage.removeItem('token');
        }
      }

      function onSuccess(model) {
        if (callback && typeof callback === 'function') {
          callback(undefined, model);
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

  return UserModel;

});
