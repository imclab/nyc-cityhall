'use strict';

define([
  'chai',
  'models/user'
], function(Chai, UserModel) {

  var expect = Chai.expect;
  var user = new UserModel();

  describe('#Model: User', function() {

    describe('@Create', function() {
      it('user should be a instance of UserModel', function() {
        expect(user).to.instanceOf(UserModel);
      });
    });

  });

});
