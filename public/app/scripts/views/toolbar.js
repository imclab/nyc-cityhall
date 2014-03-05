'use strict';

define([
  'backbone',
  'models/filter'
], function(Backbone, filterModel) {

  var ToolbarView = Backbone.View.extend({

    el: '#toolbarView',

    events: {
      'change #indicatorType': 'changeType',
      'change #indicatorPeriod': 'changePeriod',
      'change #indicatorSort': 'changeSort'
    },

    initialize: function() {
      var self = this;

      this.filter = filterModel;

      this.filter.on('change', function() {
        console.log(self.filter.toJSON());
      });
    },

    changeType: function(e) {
      var value = $(e.currentTarget).val();
      this.filter.set('type', value);
    },

    changePeriod: function(e) {
      var value = $(e.currentTarget).val();
      this.filter.set('period', value);
    },

    changeSort: function(e) {
      var value = $(e.currentTarget).val();
      this.filter.set('sort', value);
    }

  });

  return ToolbarView;

});
