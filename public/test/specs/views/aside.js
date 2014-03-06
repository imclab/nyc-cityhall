'use strict';

define([
  'chai',
  'views/aside'
], function(Chai, AsideView) {

  var expect = Chai.expect;
  var aside = new AsideView();

  describe('#View: Aside', function() {

    describe('@Create', function() {

      it('aside should be a instance of AsideView', function() {
        expect(aside).to.instanceOf(AsideView);
      });

    });

  });

});
