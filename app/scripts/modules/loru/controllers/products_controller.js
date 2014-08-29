'use strict';

angular.module('pdLoru')
  .controller('LoruProductsCtrl', function ($scope, products) {
    $scope.products = products;
  })
  .controller('LoruProductEditCtrl', function ($scope, productsTypes, categories, product, loruProductsApi, growl) {
    $scope.types = productsTypes;
    $scope.categories = categories;
    $scope.product = product;
    $scope.saveProduct = function () {
      loruProductsApi.saveProduct($scope.product)
        .then(function () { growl.addSuccessMessage('Товар был успешно сохранен'); });
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
        .then(function () { growl.addSuccessMessage('Товар был успешно добавлен'); });
    };
  })
;
