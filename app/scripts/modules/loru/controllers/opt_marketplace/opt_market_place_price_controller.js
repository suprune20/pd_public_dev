'use strict';

angular.module('pdLoru')
  .controller('OptMarketplacePriceCtrl', function ($scope, supplierStore, cart, categories, $modal, growl) {
    $scope.supplierStore = supplierStore;
    $scope.categories = categories;
    $scope.cart = cart;
    $scope.formData = {
      showAll: true,
      quantities: {}
    };
    $scope.checkout = function () {
      $modal.open({
        templateUrl: 'views/modules/loru/opt_marketplace/checkout_cart.modal.html',
        controller: function ($scope, $modalInstance) {
          $scope.cart = cart;
          $scope.checkout = function () {
            cart.checkout().then(function () { $modalInstance.close(); });
          };
        }
      }).result.then(function () {
          // clear selected quantities of products
          $scope.formData.quantities = {};
          growl.addSuccessMessage('Ваш заказ был успешно добавлен');
        });
    };

    // Store filters
    $scope.filters = {
      category: []
    };
    $scope.applyFilter = function () {
      var filters = _.cloneDeep($scope.filters);
      // clean categories filter
      filters.category = _.filter(filters.category);
      supplierStore.loadStoreData(filters);
    };
  })
;
