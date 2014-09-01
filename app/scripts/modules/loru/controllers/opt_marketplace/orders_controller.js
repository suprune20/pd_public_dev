'use strict';

angular.module('pdLoru')
  .controller('OptMarketplaceMyOrdersCtrl', function ($scope, ordersCollection) {
    $scope.orders = ordersCollection;
  })
  .controller('OptMarketplaceOrderEditCtrl', function ($scope, pageData, cart, $modal, growl) {
    $scope.supplierStore = pageData.supplierStore;
    $scope.categories = pageData.categories;

    $scope.formData = {
      showAll: false,
      quantities: {}
    };
    // restore quantity of products
    _.each(pageData.order.products, function (orderItem) {
      $scope.formData.quantities[orderItem.id] = orderItem.count;
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
;
