'use strict';

angular.module('pdLoru')
  .controller('LoruProductsListCtrl', function ($scope, categories, loruProducts, $q, growl) {
    $scope.categories = categories;
    $scope.applyFilter = function () {
      var filters = _.cloneDeep($scope.filters);
      // clean categories filter
      filters.category = _.filter(filters.selectedCategories);
      loruProducts.getProducts(filters).then(function (products) { $scope.products = products; });
    };
    $scope.applyFilter();
    $scope.updateProduct = function (product) {
      // Reset showing flag if has been resetting prices
      if (!product.retailPrice) {
        product.isShownInRetailCatalog = false;
      }
      if (!product.tradePrice) {
        product.isShownInTradeCatalog = false;
      }

      var updateModel = _.transform(product, function (result, value, key) {
        if (_.contains(['id', 'isShownInRetailCatalog', 'isShownInTradeCatalog', 'tradePrice', 'retailPrice'], key)) {
          result[key] = value;
          return result;
        }
      }, {});
      $scope.disabledVisibilityControls = true;

      return loruProducts.saveProduct(updateModel)
        .catch(function (errorData) {
          growl.addErrorMessage(errorData.message || 'Произошла неизвестная ошибка');
          return $q.reject();
        })
        .finally(function () { $scope.disabledVisibilityControls = false; });
    };
  })
  .controller('LoruProductEditCtrl', function ($scope, productsTypes, categories, product, loruProductsApi, growl) {
    $scope.types = productsTypes;
    $scope.categories = categories;
    $scope.product = product;
    $scope.saveProduct = function () {
      loruProductsApi.saveProduct($scope.product)
        .then(function () {
          growl.addSuccessMessage('Товар был успешно сохранен');
          $scope.$state.go('loru.products.list');
        });
    };
  })
  .controller('LoruProductAddCtrl', function ($scope, productsTypes, categories, loruProductsApi, growl) {
    $scope.types = productsTypes;
    $scope.categories = categories;
    $scope.product = {
      measurementUnit: 'шт.',
      categoryId: 20
    };
    $scope.saveProduct = function () {
      loruProductsApi.addProduct($scope.product)
        .then(function () {
          growl.addSuccessMessage('Товар был успешно добавлен');
          $scope.$state.go('loru.products.list');
        });
    };
  })
;
