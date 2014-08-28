'use strict';

angular.module('pdLoru')
  .controller('LoruProductsCtrl', function ($scope, products) {
    $scope.products = products;
  })
  .controller('LoruProductEditCtrl', function ($scope, product) {
    $scope.product = product;
  })
;
