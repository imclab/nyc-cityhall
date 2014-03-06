'use strict';

define([
  'chai',
  'views/login'
], function(Chai, LoginView) {

  var expect = Chai.expect;
  var login = new LoginView();

  describe('#View: Login', function() {

    describe('@Create', function() {

      it('login should be a instance of LoginView', function() {
        expect(login).to.instanceOf(LoginView);
      });

    });

  });

});
