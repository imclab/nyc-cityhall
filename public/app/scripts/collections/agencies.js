'use strict';

define([
  'backbone',
  'models/agency'
], function(Backbone, AgencyModel) {

  var AgenciesCollection = Backbone.Collection.extend({

    model: AgencyModel

  });

  return AgenciesCollection;

});
