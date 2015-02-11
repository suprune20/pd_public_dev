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
        // get products for supplier
        //if ('posted' === orderModel.status) {
        //  var productsProvider = (new CatalogRefactored(100)).productsDataProvider;
        //  productsProvider.applyFilters({
        //    supplier: [19]
        //  });
        //  productsProvider.getProducts();
        //
        //
        //  $scope.shopServices = _.map(shopServices, function (service) {
        //    return {
        //      service: service,
        //      isSelected: false
        //    };
        //  });
        //  $scope.$watch('shopServices', function (services) {
        //    $scope.isSelectedAnyServices = _.some(services, 'isSelected');
        //  }, true);
        //}


        $scope.shopServices = _.map([
          {
            id: 1,
            title: 'Заказ фотографии',
            price: parseFloat(Math.random() * 1000).toFixed(2)
          },
          {
            id: 2,
            title: 'Венок',
            price: parseFloat(Math.random() * 1000).toFixed(2)
          }
        ], function (service) {
          return {
            service: service,
            isSelected: false
          };
        });
        $scope.$watch('shopServices', function (services) {
          $scope.isSelectedAnyServices = _.some(services, 'isSelected');
        }, true);

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
        $scope.payOrder = function () {

        };

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
      }
    }).result
      // return to orders list state after closing details modal
      .catch(function () { $state.go(ordersListState); });
  })
;
