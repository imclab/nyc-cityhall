'use strict';

define([
  'chai',
  'views/map'
], function(Chai, MapView) {

  var expect = Chai.expect;
  var map = new MapView();

  describe('#View: Map', function() {

    describe('@Create', function() {

      it('map should be a instance of MapView', function() {
        expect(map).to.instanceOf(MapView);
      });

    });

  });

});
