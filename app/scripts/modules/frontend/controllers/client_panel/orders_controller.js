/* jshint -W069 */

'use strict';

angular.module('pdFrontend')
  .controller('ClientOrdersListCtrl', function ($scope, ordersCollection, orderDetailsState) {
    $scope.orderDetailsState = orderDetailsState;
    $scope.orders = ordersCollection;
  })
  .controller('ClientOrderDetailsCtrl', function ($state, $stateParams, $modal, growl, pdFrontendOrders, orderModel,
                                                  ordersListState
  ) {
    $modal.open({
      templateUrl: 'views/modules/frontend/client/orders/details.modal.html',
      controller: function ($scope, CatalogRefactored) {
        var servicesCost = _.reduce(orderModel.services, function (sum, service) {
          return sum + service.price;
        }, 0);
        var calculateProductsCost = function (productsCollection) {
          return _.reduce(productsCollection, function (sum, product) {
            return sum + (product.price * product.quantity);
          }, 0);
        };
        $scope.totalCost = servicesCost + calculateProductsCost(orderModel.products);

        // get products for supplier
        if ('posted' === orderModel.status) {
          var productsProvider = (new CatalogRefactored(100)).productsDataProvider;
          var initialProducts = _.sortBy(_.map(orderModel.products, function (product) {
            return {
              id: product.productId,
              qty: product.quantity
            };
          }), 'id');

          productsProvider.applyFilters({
            supplier: [orderModel.supplierId]
          }).then(function () {
            $scope.products = _.map(productsProvider.getProducts(), function (product) {
              var previousSelectedProduct = _.findWhere(orderModel.products, {productId: product.id});

              return {
                product: product,
                isSelected: !!previousSelectedProduct,
                qty: !!previousSelectedProduct ? previousSelectedProduct.quantity : 0
              };
            });
          });

          $scope.$watch('products', function () {
            var selectedProducts = _.filter($scope.products, 'isSelected');

            $scope.changedProductsState = _(selectedProducts)
              .map(function (productMeta) {
                return {
                  id: productMeta.product.id,
                  qty: productMeta.qty
                };
              })
              .sortBy('id')
              .value();
            $scope.totalCost = servicesCost + calculateProductsCost(_.map(selectedProducts, function (productMeta) {
              var product = productMeta.product;
              product.quantity = productMeta.qty;

              return product;
            }));
            $scope.hasChangedProducts = !_.isEqual(initialProducts, $scope.changedProductsState);
          }, true);

          $scope.onChangedTab = function (tabName) {
            $scope.activeTab = tabName;
          };

          $scope.saveProductsChanges = function () {
            pdFrontendOrders.saveOrderProducts(orderModel.id, _.map($scope.changedProductsState, function (product) {
              return {
                productId: product.id,
                quantity: product.qty
              };
            })).then(function () {
              initialProducts = $scope.changedProductsState;
              $scope.hasChangedProducts = false;
            });
          };
        }

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
        $scope.changeRating = function () {
          var ratingValues = [null, true, false];
          $scope.order.clientRating = ratingValues[(ratingValues.indexOf($scope.order.clientRating) + 1) % 3];
        };
        $scope.payOrder = function () {};

        var savedRating = $scope.order.clientRating;
        $scope.saveRating = function () {
          pdFrontendOrders.ratingOrder(orderModel.id, $scope.order.clientRating)
            .then(function () {
              savedRating = $scope.order.clientRating;
            }, function () {
              $scope.order.clientRating = savedRating;
              growl.addErrorMessage('Произошла ошибка при установке рейтинга');
            });
        };

        if ('accepted' === orderModel.status && !$stateParams.successPayment) {
          // get payment details from server
          pdFrontendOrders.getOrderPaymentWebpayDetails(orderModel.id)
            .then(function (webpayData) { $scope.paymentData = webpayData; });
        }

        // Postback url for success payment
        if ($stateParams.successPayment && $stateParams['wsb_tid']) {
          pdFrontendOrders.payOrderWithPaymentService(orderModel.id, 'webpay', $stateParams['wsb_tid'])
            .then(function () {
              $scope.paymentSuccess = true;
            });
        }

        $scope.saveOrderChanges = function () {};
      }
    }).result
      // return to orders list state after closing details modal
      .catch(function () { $state.go(ordersListState); });
  })
;
