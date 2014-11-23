'use strict';

angular.module('pdFrontend')
  .service('pdFrontendOrderApi', function ($http, pdConfig, $q, $timeout, $upload) {
    return {
      getAvailablePerformers: function (type, placeId, location) {
        return $http.get(pdConfig.apiEndpoint + 'client/available_performers', {
          params: {
            type: type,
            placeId: placeId,
            'location[latitude]': location.latitude,
            'location[longitude]': location.longitude
          }
        }).then(function (response) { return response.data; });
      },
      postOrder: function (orderModel) {
        return $http.post(pdConfig.apiEndpoint + 'client/orders', orderModel)
          .then(function (response) { return response.data; });
      },
      getOrders: function () {
        return $http.get(pdConfig.apiEndpoint + 'orders')
          .then(function (response) { return response.data; });
      },
      getOrder: function (orderId) {
        return $http.get(pdConfig.apiEndpoint + 'orders/' + orderId)
          .then(function (response) { return response.data; });
      },
      updateOrder: function (orderId, updatedData) {
        return $http.put(pdConfig.apiEndpoint + 'client/orders/' + orderId, updatedData)
          .then(function (response) { return response.data; });
      },
      postOrderPayment: function (orderId, paymentType, receiptImageFile) {
        return $upload.upload({
          url: pdConfig.apiEndpoint + 'client/orders/' + orderId + '/payments',
          tracker: 'commonLoadingTracker',
          data: {
            type: paymentType
          },
          file: receiptImageFile
        });
      },
      getOrderComments: function (orderId) {
        return $http.get(pdConfig.apiEndpoint + 'orders/' + orderId + '/comments')
          .then(function (response) { return response.data; });
      },
      postOrderComment: function (orderId, commentText) {
        return $q.when({
            "id": 2,
            "user": {
              "id": 45,
              "username": "ОАО ‘Добрые услуги’"
            },
            "createdAt": (new Date()).toISOString(),
            "comment": commentText
          }
        );

        return $http.post(pdConfig.apiEndpoint + 'orders/' + orderId + '/comments', { comment: commentText })
          .then(function (response) { return response.data; });
      },
      getOrderResults: function (orderId) {
        return $q.when([{
          type: 'image',
          fileUrl: 'http://lorempixel.com/100/100',
          createdAt: '2014-11-02T10:12:26+00:00'
        }, {
          type: 'image',
          fileUrl: 'http://lorempixel.com/100/100',
          createdAt: '2014-11-21T10:12:26+00:00'
        }]);

        return $http.get(pdConfig.apiEndpoint + 'orders/' + orderId + '/results')
          .then(function (response) { return response.data; });
      },
      postOrderResults: function (orderId, attachments) {
        return $q.when({
          type: 'image',
          fileUrl: 'http://lorempixel.com/100/100',
          createdAt: (new Date()).toISOString()
        });

        return $upload.upload({
          url: pdConfig.apiEndpoint + 'orders/' + orderId + '/results',
          tracker: 'commonLoadingTracker',
          file: attachments
        });
      }
    };
  })
;
