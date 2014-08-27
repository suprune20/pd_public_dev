'use strict';

angular.module('pdLoru')
  .controller('OptMarketplaceMyOrdersCtrl', function ($scope, ordersCollection) {
    $scope.orders = ordersCollection;
  })
  .controller('OptMarketplaceOrderEditCtrl', function ($scope, order, supplierStore, cart, $modal, growl) {
    $scope.supplierStoreData = supplierStore;

    $scope.formData = {
      showAll: false,
      quantities: {}
    };
    // restore quantity of products
    _.each(order.products, function (orderItem) {
      $scope.formData.quantities[orderItem.id] = orderItem.count;
    });
    // restore cart state from exists
    cart.restoreData(order, supplierStore);
    $scope.cart = cart;

    $scope.checkout = function () {
      $modal.open({
        templateUrl: 'views/modules/loru/opt_marketplace/checkout_cart.modal.html',
        controller: function ($scope, $modalInstance) {
          $scope.isEdit = true;
          $scope.cart = cart;
          $scope.checkout = function () {
            cart.saveOrderChanges($scope.$state.params.orderId).then(function () { $modalInstance.close(); });
          };
        }
      }).result.then(function () {
          growl.addSuccessMessage('Изменения в Вашем заказе были успешно сохранены');
        });
    };
  })
;
