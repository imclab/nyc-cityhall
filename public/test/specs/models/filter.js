'use strict';

define([
  'chai',
  'models/filter'
], function(Chai, filterModel) {

  var expect = Chai.expect;
  var filter = filterModel.instance;

  describe('#Model: Filter', function() {

    describe('@Create', function() {
      it('filter should be a instance of filterModel', function() {
        expect(filter).to.instanceOf(filterModel.model);
      });
    });

  });

});
