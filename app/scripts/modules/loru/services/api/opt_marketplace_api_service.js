'use strict';

angular.module('pdLoru')
  .service('optMarketPlaceApi', function ($http, pdConfig) {
    return {
      getSupplierStore: function (supplierId, paramsData) {
        return $http.get(pdConfig.apiEndpoint + 'optplaces/suppliers/' + supplierId + '/products', {
          params: paramsData
        }).then(function (response) { return response.data; });
      },
      getSupplier: function (supplierId) {
        return $http.get(pdConfig.apiEndpoint + 'optplaces/suppliers/' + supplierId)
          .then(function (response) {
            return response.data;
          });
      },
      getSuppliers: function () {
        return $http.get(pdConfig.apiEndpoint + 'optplaces/suppliers')
          .then(function (response) {
            return response.data;
          });
      },
      postOrder: function (productsData, commentText, customer) {
        return $http.post(pdConfig.apiEndpoint + 'optplaces/orders', {
          products: productsData,
          comment: commentText,
          customer: customer
        });
      },
      saveOrder: function (orderId, productsData, commentText) {
        return $http.put(pdConfig.apiEndpoint + 'optplaces/orders/' + orderId, {
          products: productsData,
          comment: commentText
        });
      },
      getMyOrders: function () {
        return $http.get(pdConfig.apiEndpoint + 'optplaces/orders')
          .then(function (response) { return response.data; });
      },
      getOrder: function (id) {
        return $http.get(pdConfig.apiEndpoint + 'optplaces/orders/' + id)
          .then(function (response) { return response.data; });
      }
    };
  })
;
