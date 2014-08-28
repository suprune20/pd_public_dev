'use strict';

angular.module('pdLoru')
  .service('loruProducts', function (loruProductsApi) {
    return {
      getProducts: function () {
        return loruProductsApi.getProducts();
      },
      getProduct: function (productId) {
        return loruProductsApi.getProduct(productId);
      }
    };
  })
;
