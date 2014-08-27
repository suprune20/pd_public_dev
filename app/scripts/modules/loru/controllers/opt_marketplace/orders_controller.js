'use strict';

angular.module('pdLoru')
  .controller('OptMarketplaceMyOrdersCtrl', function ($scope, ordersCollection) {
    $scope.orders = ordersCollection;
  })
;
