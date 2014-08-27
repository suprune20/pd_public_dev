'use strict';

angular.module('pdLoru')
  .service('optMarketPlaceApi', function ($http, pdConfig) {
    return {
      getSupplierStore: function (supplierId) {
        return $http.get(pdConfig.apiEndpoint + 'optplaces/suppliers/' + supplierId + '/products')
          .then(function (response) { return response.data; });
      },
      postOrder: function (productsData, commentText) {
        return $http.post(pdConfig.apiEndpoint + 'optplaces/orders', {
          products: productsData,
          comment: commentText
        });
      },
      getMyOrders: function () {
        return $http.get(pdConfig.apiEndpoint + 'optplaces/orders')
          .then(function (response) { return response.data; });
      }
    };
  })
;
