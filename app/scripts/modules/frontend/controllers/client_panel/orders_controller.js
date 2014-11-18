'use strict';

angular.module('pdFrontend')
  .controller('ClientOrdersListCtrl', function ($scope, ordersCollection) {
    $scope.orders = ordersCollection;
  })
  .controller('ClientOrderDetailsCtrl', function ($scope, orderModel) {
    $scope.order = orderModel;
  })
;
