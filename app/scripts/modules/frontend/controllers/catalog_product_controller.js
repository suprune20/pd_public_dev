'use strict';

angular.module('pdFrontend')
  .controller('CatalogProductCtrl', function ($scope, $modal, $state) {
    $modal.open({
      templateUrl: 'views/modules/frontend/catalog/product.details.modal.html',
      windowClass: 'catalog-product-modal',
      resolve: {
        productData: function () {
          return $scope.catalog.getProduct($state.params.productId);
        }
      },
      controller: function ($scope, productData) {
        // set product name into page title
        $scope.seo
          .setTitle(productData.name)
          .setDescription(productData.name + '. ' + productData.description);
        $scope.productData = productData;
      }
    }).result.catch(function () {
        $state.go('catalog');
      });
  })
;
