'use strict';

angular.module('pdLoru')
  .service('loruProductsApi', function ($http, pdConfig, $q) {
    return {
      getProducts: function () {
        return $http.get(pdConfig.apiEndpoint + 'loru/products')
          .then(function (response) { return response.data; });
      },
      getProduct: function (productId) {
        return $q.when({});
        return $http.get(pdConfig.apiEndpoint + 'loru/products' + productId)
          .then(function (response) { return response.data; });
      }
    };
  })
;
