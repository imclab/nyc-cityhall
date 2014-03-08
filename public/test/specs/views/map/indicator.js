'use strict';

define([
  'chai',
  'views/map/indicator'
], function(Chai, IndicatorView) {

  var expect = Chai.expect;
  var indicator = new IndicatorView();

  describe('#View: Map Indicator', function() {

    describe('@Create', function() {

      it('indicator should be a instance of IndicatorView', function() {
        expect(indicator).to.instanceOf(IndicatorView);
      });

    });

  });

});
