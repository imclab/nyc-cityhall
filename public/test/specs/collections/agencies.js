'use strict';

define([
  'chai',
  'collections/agencies'
], function(Chai, AgenciesCollection) {

  var expect = Chai.expect;
  var agencies = new AgenciesCollection();

  describe('#Collection: Agencies', function() {

    describe('@Create', function() {
      it('agencies should be a instance of AgenciesCollection', function() {
        expect(agencies).to.instanceOf(AgenciesCollection);
      });
    });

  });

});
