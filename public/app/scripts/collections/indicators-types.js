'use strict';

define([
  'backbone',
  'models/indicator-type'
], function(Backbone, IndicatorTypeModel) {

  var IndicatorsTypesCollection = Backbone.Collection.extend({

    model: IndicatorTypeModel

  });

  return IndicatorsTypesCollection;

});
