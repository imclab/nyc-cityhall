'use strict';

define([
  'chai',
  'collections/indicators'
], function(Chai, indicatorsCollection) {

  var expect = Chai.expect;
  var indicators = indicatorsCollection.instance;

  describe('#Collection: Indicators', function() {

    describe('@Create', function() {
      it('indicators should be a instance of IndicatorsCollection', function() {
        expect(indicators).to.instanceOf(indicatorsCollection.collection);
      });
    });

  });

});
