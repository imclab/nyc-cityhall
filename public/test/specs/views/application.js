'use strict';

define([
  'chai',
  'views/application'
], function(Chai, ApplicationView) {

  var expect = Chai.expect;
  var application = new ApplicationView();

  describe('#View: Application', function() {

    describe('@Create', function() {

      it('application should be a instance of ApplicationView', function() {
        expect(application).to.instanceOf(ApplicationView);
      });

    });

  });

});
