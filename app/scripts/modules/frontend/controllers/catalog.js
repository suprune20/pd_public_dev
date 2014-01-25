'use strict';

angular.module('pdFrontend')
  .controller('CatalogCtrl', function ($scope, $modal, $routeParams, $location, Catalog) {
    var openProductDetailsModal = function (productId) {
      $location.search('productId', productId);
      var productData = $scope.catalog.getProduct(productId);

      $modal.open({
        templateUrl: 'views/catalog/product.details.modal.html',
        windowClass: 'catalog-product-modal',
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
    };

    $scope.filters = {};
    $scope.catalog = new Catalog();
    // Get filters data
    $scope.catalog.getCategories().then(function (categories) {
      $scope.categoriesFilter = categories;
    });
    $scope.catalog.getFilters().then(function (filtersData) {
      $scope.suppliersFilter = filtersData.supplier;
      $scope.placesFilter = filtersData.place;
    });

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
    $scope.catalog.productsDataProvider.applyFilters($scope.filters);

    $scope.openProductDetailsModal = openProductDetailsModal;
    $scope.applyFilters = function () {
      _.forEach($scope.filters, function (value, filterName) {
        $location.search('filter_' + filterName, value);
      });
      $scope.catalog.productsDataProvider.applyFilters($scope.filters);
    };
    $scope.clearFilters = function () {
      _.forEach($scope.filters, function (value, filterName) {
        $location.search('filter_' + filterName, null);
      });
      $scope.filters = {};
      $scope.catalog.productsDataProvider.applyFilters($scope.filters);
    };
  })
;
