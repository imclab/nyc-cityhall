'use strict';

define([
  'chai',
  'models/agency'
], function(Chai, AgencyModel) {

  var expect = Chai.expect;
  var agency = new AgencyModel();

  describe('#Model: Agency', function() {

    describe('@Create', function() {
      it('agency should be a instance of AgencyModel', function() {
        expect(agency).to.instanceOf(AgencyModel);
      });
    });

  });

});
