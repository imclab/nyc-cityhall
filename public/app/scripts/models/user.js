'use strict';

define(['backbone', 'moment', 'sprintf'], function(Backbone, moment, sprintf) {

  var UserModel = Backbone.Model.extend({

    url: 'http://nyc-cityhall.cartodb.com/api/v2/sql',

    check: function(username, password) {
      var date = moment().format();
      var query = sprintf('SELECT log_in(\'%s\',\'%s\',\'%s\') AS token', username, password, date);

      this.fetch({
        data: {
          q: query,
          format: 'json'
        },
        success: function(model) {
          console.log(model);
        }
      });
    }

  });

  return UserModel;

});
