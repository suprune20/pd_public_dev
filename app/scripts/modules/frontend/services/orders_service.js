'use strict';

angular.module('pdFrontend')
  .service('pdFrontendOrders', function (pdFrontendOrderApi) {
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
        return pdFrontendOrderApi.getOrder(orderId);
      },
      approveOrder: function (orderId, comment) {
        return pdFrontendOrderApi.updateOrder(orderId, {
          approved: true,
          finalComment: comment
        });
      },
      declineOrder: function (orderId) {
        return pdFrontendOrderApi.updateOrder(orderId, {
          approved: false
        });
      },
      payOrderWithReceiptScan: function (orderId, receiptImageFile) {
        return pdFrontendOrderApi.postOrderPayment(orderId, 'receipt', receiptImageFile);
      }
    };
  })
;
