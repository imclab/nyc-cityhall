'use strict';

define([
  'chai',
  'views/application/indicators'
], function(Chai, IndicatorsView) {

  var expect = Chai.expect;
  var indicators = new IndicatorsView();

  describe('#View: Indicators', function() {

    describe('@Create', function() {

      it('indicators should be a instance of IndicatorsView', function() {
        expect(indicators).to.instanceOf(IndicatorsView);
      });

    });

  });

});
