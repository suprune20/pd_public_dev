/* jshint -W069 */

'use strict';

angular.module('pdFrontend')
  .controller('ClientOrdersListCtrl', function ($scope, ordersCollection, orderDetailsState) {
    $scope.orderDetailsState = orderDetailsState;
    $scope.orders = ordersCollection;
    $scope.$on('orders:changed', function (event, eventData) {
      _.map($scope.orders, function (order) {
        if (eventData.orderId !== order.id) {
          return;
        }

        order.totalPrice = eventData.totalCost;
        order.modifiedAt = eventData.modifiedAt;
      });
    });
    $scope.$on('orders:deleted', function (event, eventData) {
      _.remove($scope.orders, function (order) {
        return order.id === eventData.orderId;
      });
    });
  })

  .controller('ClientOrderDetailsCtrl', function ($state, $modal, orderModel, ordersListState) {
    $modal.open({
      templateUrl: 'views/modules/frontend/client/orders/details.modal.html',
      resolve: {
        orderModel: function () {
          return orderModel;
        }
      },
      controller: 'ClientOrderDetailsModalCtrl'
    }).result
      // return to orders list state after closing details modal
      .catch(function () { $state.go(ordersListState); });
  })
;
