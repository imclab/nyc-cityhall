'use strict';

define([
  'chai',
  'models/indicator-type'
], function(Chai, IndicatorTypeModel) {

  var expect = Chai.expect;
  var indicatorType = new IndicatorTypeModel();

  describe('#Model: Indicator Type', function() {

    describe('@Create', function() {
      it('indicatorType should be a instance of IndicatorTypeModel', function() {
        expect(indicatorType).to.instanceOf(IndicatorTypeModel);
      });
    });

  });

});
