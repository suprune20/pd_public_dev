'use strict';

angular.module('pdLoru')
  .controller('OptMarketplaceMyOrdersCtrl', function ($scope, ordersCollection, $modal) {
    $scope.orders = ordersCollection;
    $scope.openRetailOrderModal = function (order) {
      $modal.open({
        templateUrl: 'views/modules/loru/opt_marketplace/retail_order_details.modal.html',
        resolve: {
          orderModel: ['pdFrontendOrders', function (pdFrontendOrders) {
            return pdFrontendOrders.getOrderDetails(order.id);
          }]
        },
        controller: function ($scope, $modalInstance, orderModel, pdFrontendOrders) {
          $scope.order = orderModel;

          $scope.orderForm = { commentText: '' };
          $scope.postComment = function () {
            pdFrontendOrders.postCommentForOrder(orderModel.id, $scope.orderForm.commentText)
              .then(function (postedCommentModel) {
                // reset comment text input
                $scope.orderForm.commentText = '';
                // add posted comment data into comments collections
                $scope.order.comments.push(postedCommentModel);
              });
          };
          $scope.$watch('orderForm.attachment', function (attachment) {
            if (!attachment) {
              return;
            }

            pdFrontendOrders.postOrderImage(orderModel.id, attachment)
              .then(function (postedAttachment) {
                $scope.order.results.push(postedAttachment);
              });
          });
          $scope.closeOrder = function () {
            pdFrontendOrders.approveOrder(orderModel.id)
              .then(function () { $modalInstance.dismiss(); });
          };
        }
      });
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
