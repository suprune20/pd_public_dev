'use strict';

angular.module('pdLoru')
  .service('loruProducts', function (loruProductsApi) {
    return {
      getProducts: function (filters) {
        return loruProductsApi.getProducts(filters);
      },
      getProduct: function (productId) {
        return loruProductsApi.getProduct(productId);
      },
      addProduct: function (productModel) {
        return loruProductsApi.addProduct(productModel);
      },
      saveProduct: function (productModel) {
        return loruProductsApi.saveProduct(productModel);
      }
    };
  })
;
