'use strict';

angular.module('pdFrontend')
  .controller('ClientOrdersListCtrl', function ($scope, ordersCollection) {
    $scope.orders = ordersCollection;
  })
  .controller('ClientOrderDetailsCtrl', function ($state, $modal, pdFrontendOrders, orderModel) {
    $modal.open({
      templateUrl: 'views/modules/frontend/client/orders/details.modal.html',
      controller: function ($scope) {
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
        $scope.payOrder = function () {
          alert('Comming Soon!!');
        };
      }
    }).result
      // return to orders list state after closing details modal
      .catch(function () { $state.go('clientOrders'); });
  })
;
