'use strict';

angular.module('pdFrontend')
  .service('pdFrontendOrders', function (pdFrontendOrderApi, $q) {
    return {
      getAvailablePerformersForPhoto: function (placeId, location) {
        return pdFrontendOrderApi.getAvailablePerformers('photo', placeId, location);
      },
      createOrder: function (orderModel) {
        return pdFrontendOrderApi.postOrder(orderModel);
      },
      getOrdersList: function () {
        return pdFrontendOrderApi.getOrders();
      },
      getOrderDetails: function (orderId) {
        return pdFrontendOrderApi.getOrder(orderId)
          .then(function (orderModel) {
            return $q.all([pdFrontendOrderApi.getOrderComments(orderId), pdFrontendOrderApi.getOrderResults(orderId)])
              .then(function (results) {
                orderModel.comments = results[0];
                orderModel.results = results[1];

                return orderModel;
              });
          });
      },
      approveOrder: function (orderId) {
        return pdFrontendOrderApi.updateOrder(orderId, {
          status: 'done'
        });
      },
      payOrderWithReceiptScan: function (orderId, receiptImageFile) {
        return pdFrontendOrderApi.postOrderPayment(orderId, 'receipt', receiptImageFile);
      },
      postCommentForOrder: function (orderId, commentText) {
        return pdFrontendOrderApi.postOrderComment(orderId, commentText);
      },
      postOrderAttachment: function (orderId, attachmentFile) {
        return pdFrontendOrderApi.postOrderResults(orderId, attachmentFile);
      }
    };
  })
;
