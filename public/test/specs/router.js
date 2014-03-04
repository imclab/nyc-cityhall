'use strict';

define([
  'chai',
  'router'
], function(Chai, Router) {

  var expect = Chai.expect;
  var router = new Router();

  describe('#Router', function() {

    describe('@Create', function() {

      it('router should be a instance of Routes', function() {
        expect(router).to.instanceOf(Router);
      });

    });

  });

});
