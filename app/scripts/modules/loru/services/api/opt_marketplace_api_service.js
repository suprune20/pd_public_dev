'use strict';

angular.module('pdLoru')
  .service('optMarketPlaceApi', function ($http, pdConfig) {
    return {
      getSupplierStore: function (supplierId) {
        return $http.get(pdConfig.apiEndpoint + 'optplaces/suppliers/' + supplierId + '/products')
          .then(function (response) { return response.data; });
      }
    };
  })
;
