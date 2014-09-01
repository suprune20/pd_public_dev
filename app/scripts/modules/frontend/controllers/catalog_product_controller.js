'use strict';

angular.module('pdFrontend')
  .controller('CatalogProductCtrl', function ($scope, $modal, $state) {
    $modal.open({
      templateUrl: 'views/modules/frontend/catalog/product.details.modal.html',
      windowClass: 'catalog-product-modal',
      resolve: {
        productData: function () {
          return $scope.catalog.getProduct($state.params.productId)
            .then(function (productData) {
              productData.price = $state.params.showOptPrice ? productData.priceWholesale : productData.price;

              return productData;
            });
        }
      },
      controller: function ($scope, productData) {
        // set product name into page title
        $scope.seo
          .setTitle(productData.name + ' - ' + productData.category)
          .setDescription(productData.name + '. ' + (productData.description || productData.supplier.address));
        $scope.productData = productData;
      }
    }).result.catch(function (rejection) {
        if (rejection && 404 === rejection.status) {
          $scope.seo.setStatusCode(404);
          return;
        }

        if ('catalog.product' === $state.current.name) {
          $state.go('catalog');
        }
      });
  })
;
