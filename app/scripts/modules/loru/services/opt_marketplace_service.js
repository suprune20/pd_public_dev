'use strict';

angular.module('pdLoru')
  .service('optMarketplace', function (optMarketPlaceApi) {
    return {
      getSupplierStore: function (supplierId) {
        return optMarketPlaceApi.getSupplierStore(supplierId);
      }
    };
  })
;
