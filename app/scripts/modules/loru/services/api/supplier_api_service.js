'use strict';

angular.module('pdLoru')
  .service('pdLoruSupplierApi', function ($http, pdConfig) {
    return {
      addFavoriteSupplier: function (supplierId) {
        return $http.post(pdConfig.apiEndpoint + 'loru/favorite_suppliers/' + supplierId);
      },
      removeFavoriteSupplier: function (supplierId) {
        return $http.delete(pdConfig.apiEndpoint + 'loru/favorite_suppliers/' + supplierId);
      },
      getFavoriteSuppliers: function () {
        return $http.get(pdConfig.apiEndpoint + 'loru/favorite_suppliers')
          .then(function (response) { return response.data; });
      }
    };
  })
;
