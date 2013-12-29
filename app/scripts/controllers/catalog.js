'use strict';

angular.module('pdApp')
  .controller('CatalogCtrl', function ($scope, $modal, $routeParams, $location, Catalog) {
    $scope.catalog = new Catalog();
    function openProductDetailsModal(productId) {
      $location.search('productId', productId);
      var productData = $scope.catalog.getProduct(productId);

      $modal.open({
        templateUrl: 'views/catalog/product.details.modal.html',
        resolve: {
          productData: function () {
            return productData;
          }
        },
        controller: function ($scope, $modalInstance, productData) {
          $scope.productData = productData;
          $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
          };
        }
      })
        .result.catch(function () {
          $location.search('productId', null);
        });
    }

    // Restore previous filters/queryParams states
    if (_.has($routeParams, 'productId')) {
      openProductDetailsModal($routeParams.productId);
    }

    $scope.openProductDetailsModal = openProductDetailsModal;
  })
;
