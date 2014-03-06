'use strict';

define([
  'chai',
  'models/indicator'
], function(Chai, IndicatorModel) {

  var expect = Chai.expect;
  var indicator = new IndicatorModel();

  describe('#Model: Indicator', function() {

    describe('@Create', function() {
      it('indicator should be a instance of IndicatorModel', function() {
        expect(indicator).to.instanceOf(IndicatorModel);
      });
    });

  });

});
