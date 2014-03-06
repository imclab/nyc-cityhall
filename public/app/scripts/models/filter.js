'use strict';

define(['backbone'], function(Backbone) {

  var FilterModel = Backbone.Model.extend({

    defaults: {
      type: 'all',
      period: 'year',
      sort: 'department',
      agency: 'all'
    }

  });

  return {
    model: FilterModel,
    instance: new FilterModel()
  };

});
