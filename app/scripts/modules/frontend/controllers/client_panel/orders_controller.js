'use strict';

angular.module('pdFrontend')
  .controller('ClientOrdersListCtrl', function ($scope, ordersCollection) {
    $scope.orders = ordersCollection;
  })
  .controller('ClientOrderDetailsCtrl', function ($scope, pdFrontendOrders, orderModel) {
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
  })
;
