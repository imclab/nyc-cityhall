'use strict';

define([
  'chai',
  'views/agencies'
], function(Chai, AgenciesView) {

  var expect = Chai.expect;
  var agencies = new AgenciesView();

  describe('#View: Agencies', function() {

    describe('@Create', function() {

      it('agencies should be a instance of AgenciesView', function() {
        expect(agencies).to.instanceOf(AgenciesView);
      });

    });

  });

});
