'use strict';

define([
  'backbone',
  'models/filter'
], function(Backbone, filterModel) {

  var ToolbarView = Backbone.View.extend({

    el: '#toolbarView',

    events: {
      'click .mod-toolbar-selector a': 'changeFilter',
      'click .mod-toolbar-selector .current': 'expandOptions'
    },

    initialize: function() {
      var self = this;

      this.filter = filterModel;
      this.$options = this.$el.find('.mod-toolbar-options');

      this.filter.on('change', function() {
        console.log(self.filter.toJSON());
      });
    },

    changeFilter: function(e) {
      var element, current;

      element = $(e.currentTarget),
      current = element.closest('.mod-toolbar-selector').find('.current');

      current.text(element.text());
      this.filter.set(element.data('filter'), element.data('value'));

      this.contractOptions();

      e.preventDefault();
    },

    expandOptions: function(e) {
      $(e.currentTarget).closest('li').find('.mod-toolbar-options').toggleClass('is-expanded');
    },

    contractOptions: function() {
      this.$options.removeClass('is-expanded');
    }

  });

  return ToolbarView;

});
