'use strict';

define([
  'chai',
  'collections/indicators'
], function(Chai, IndicatorsCollection) {

  var expect = Chai.expect;
  var indicators = new IndicatorsCollection();

  describe('#Collection: Indicators', function() {

    describe('@Create', function() {
      it('indicators should be a instance of IndicatorsCollection', function() {
        expect(indicators).to.instanceOf(IndicatorsCollection);
      });
    });

  });

});
