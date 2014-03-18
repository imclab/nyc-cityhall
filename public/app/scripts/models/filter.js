'use strict';

define(['backbone'], function(Backbone) {

  var FilterModel = Backbone.Model.extend({

    defaults: {
      type: 'all',
      period: 'fytd',
      sort: 'default',
      agency: 'all',
      priority: 'all'
    }

  });

  return {
    model: FilterModel,
    instance: new FilterModel()
  };

});
