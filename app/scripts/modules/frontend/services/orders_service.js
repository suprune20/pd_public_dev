'use strict';
/* jshint -W069 */

angular.module('pdFrontend')
  .service('pdFrontendOrders', function (pdFrontendOrderApi, pdFrontendPlacesApi, $q, $sce, $state, pdConfig, appEnv) {
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
      payOrderWithPaymentService: function (orderId, paymentName, paymentToken) {
        return pdFrontendOrderApi.postOrderPayment(orderId, paymentName, undefined, paymentToken);
      },
      getOrderPaymentWebpayDetails: function (orderId) {
        return pdFrontendOrderApi.getOrderPaymentMethodDetails(orderId, 'webpay')
          .then(function (webpayData) {
            _.forEach(webpayData.items, function (item, i) {
              webpayData['wsb_invoice_item_name[' + i + ']'] = item.name;
              webpayData['wsb_invoice_item_price[' + i + ']'] = item.price;
              webpayData['wsb_invoice_item_quantity[' + i + ']'] = item.quantity;
            });
            delete webpayData.items;

            webpayData['*scart'] = '';
            webpayData['wsb_return_url'] = $state.href('clientOrders.details', {
              orderId: orderId,
              successPayment: true
            }, {absolute: true});
            webpayData['wsb_cancel_return_url'] = $state.href('clientOrders.details', {
              orderId: orderId,
              cancelPayment: true
            }, {absolute: true});

            return {
              paymentServerUrl: $sce.trustAsResourceUrl(pdConfig.paymentServers.webpay['prod' === appEnv ? 'prod' : 'test']),
              paymentProperties: webpayData
            };
          });
      },
      postCommentForOrder: function (orderId, commentText) {
        return pdFrontendOrderApi.postOrderComment(orderId, commentText);
      },
      postOrderImage: function (orderId, imageFile) {
        return pdFrontendOrderApi.postOrderResults(orderId, imageFile, {type: 'image'});
      },
      saveOrderProducts: function (orderId, productsCollection) {
        return pdFrontendOrderApi.updateOrder(orderId, {products: productsCollection});
      },
      deleteOrder: function (orderId) {
        return pdFrontendOrderApi.deleteOrder(orderId);
      }
    };
  })
;
