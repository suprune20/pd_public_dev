'use strict';

angular.module('pdFrontend')
  .service('pdFrontendOrders', function (pdFrontendOrderApi, pdFrontendPlacesApi, $q) {
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
            return $q.all([
              pdFrontendOrderApi.getOrderComments(orderId),
              pdFrontendOrderApi.getOrderResults(orderId),
              pdFrontendPlacesApi.getPlaceDetails(orderModel.placeId)
            ])
              .then(function (results) {
                orderModel.comments = results[0];
                orderModel.results = results[1];
                orderModel.place = results[2];

                return orderModel;
              });
          });
      },
      acceptOrder: function (orderId) {
        return pdFrontendOrderApi.updateOrder(orderId, {
          status: 'accepted'
        });
      },
      doneOrder: function (orderId) {
        return pdFrontendOrderApi.updateOrder(orderId, {
          status: 'done'
        });
      },
      archiveOrder: function (orderId) {
        return pdFrontendOrderApi.updateOrder(orderId, {
          isArchived: true
        });
      },
      dearchiveOrder: function (orderId) {
        return pdFrontendOrderApi.updateOrder(orderId, {
          isArchived: false
        });
      },
      ratingOrder: function (orderId, rating) {
        return pdFrontendOrderApi.updateOrder(orderId, {
          clientRating: rating
        });
      },
      payOrderWithReceiptScan: function (orderId, receiptImageFile) {
        return pdFrontendOrderApi.postOrderPayment(orderId, 'receipt', receiptImageFile);
      },
      postCommentForOrder: function (orderId, commentText) {
        return pdFrontendOrderApi.postOrderComment(orderId, commentText);
      },
      postOrderImage: function (orderId, imageFile) {
        return pdFrontendOrderApi.postOrderResults(orderId, imageFile, {type: 'image'});
      }
    };
  })
;
