'use strict';

define([
  'backbone',
  'handlebars',
  'text!../../templates/agencies.handlebars'
], function(Backbone, Handlebars, tpl) {

  var AgenciesView = Backbone.View.extend({

    el: '#agenciesView',

    template: Handlebars.compile(tpl),

    render: function() {
      this.$el.html(this.template({
        agencies: this.data
      }));
    },

    initialize: function() {
      this.data = [{
        id: 1,
        name: 'NYPD'
      }, {
        id: 2,
        name: 'DCA'
      }];

      this.render();
    }

  });

  return AgenciesView;

});
