'use strict';

define([
  'chai',
  'views/application/toolbar'
], function(Chai, ToolbarView) {

  var expect = Chai.expect;
  var toolbar = new ToolbarView();

  describe('#View: Map', function() {

    describe('@Create', function() {

      it('toolbar should be a instance of ToolbarView', function() {
        expect(toolbar).to.instanceOf(ToolbarView);
      });

    });

  });

});
