'use strict';

angular.module('pdLoru')
  .controller('OptMarketplaceMyOrdersCtrl', function ($scope, ordersCollection) {
    $scope.orders = ordersCollection;
    $scope.showOrderDetails = function (order) {
      $scope.$state.go(order.type === 'opt' ? 'order' : 'order_retail', {orderId: order.id});
    };
  })
  .controller('OptMarketplaceOrderEditCtrl', function ($scope, pageData, cart, $modal, growl) {
    $scope.supplierStore = pageData.supplierStore;
    $scope.categories = pageData.categories;
    $scope.order = pageData.order;

    $scope.formData = {
      showAll: false,
      quantities: {},
      comment: {}
    };
    // restore quantity of products
    _.each(pageData.order.products, function (orderItem) {
      $scope.formData.quantities[orderItem.id] = orderItem.count;
      $scope.formData.comment[orderItem.id] = orderItem.comment;
    });
    // restore cart state from exists
    cart.restoreData(pageData.order, pageData.supplierStore.getStoreProducts());
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
          $scope.$state.go('orders');
        });
    };

    // ToDo: remove duplicate code
    // Store filters
    $scope.filters = {
      category: []
    };
    $scope.applyFilter = function () {
      var filters = _.cloneDeep($scope.filters);
      // clean categories filter
      filters.category = _.filter(filters.category);
      pageData.supplierStore.loadStoreData(filters);
    };
  })
  .controller('OptMarketplaceOrderRetailDetailsCtrl', function ($scope, orderModel) {
    $scope.order = orderModel;
  })
;
