'use strict';

angular.module('pdApp')
  .controller('CatalogCtrl', function ($scope, $modal, $routeParams, $location, Catalog) {
    $scope.filters = {};
    $scope.catalog = new Catalog();
    // Get filters data
    $scope.categoriesFilter = $scope.catalog.getCategories();
    $scope.suppliersFilter = $scope.catalog.getFilters().suppliers;
    $scope.placesFilter = $scope.catalog.getFilters().places;

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

    // Restore product modal details from query params
    if (_.has($routeParams, 'productId')) {
      openProductDetailsModal($routeParams.productId);
    }
    // Restore filters from query params after reload
    _.forEach($routeParams, function (value, key) {
      if (/^filter_/.test(key)) {
        $scope.filters[key.replace(/^filter_/, '')] = !isNaN(value) ? parseInt(value, 10) : value;
      }
    });

    $scope.openProductDetailsModal = openProductDetailsModal;
    $scope.applyFilters = function () {
      _.forEach($scope.filters, function (value, filterName) {
        $location.search('filter_' + filterName, value);
      });
    };
    $scope.clearFilters = function () {
      _.forEach($scope.filters, function (value, filterName) {
        $location.search('filter_' + filterName, null);
      });
      $scope.filters = {};
    };
  })
;
