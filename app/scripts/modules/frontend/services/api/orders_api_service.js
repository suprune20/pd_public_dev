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
        }).then(function (response) {
          return response.data;
        });
      },
      postOrder: function (orderModel) {
        return $http.post(pdConfig.apiEndpoint + 'client/orders', orderModel)
          .then(function (response) {
            return response.data;
          });
      },
      getOrders: function () {
        return $q.when([
          {
            'id': 12323,
            'type': 'place_photo',
            'location': {
              'latitude': 53.12312,
              'longitude': 23.3123
            },
            'owner': {
              'id': 43,
              name: 'John Dow'
            },
            'performer': {
              'id': 45,
              name: 'Microsoft'
            }
          }
        ]);

        return $http.get(pdConfig.apiEndpoint + 'client/orders')
          .then(function (response) {
            return response.data;
          });
      },
      getOrder: function (orderId) {
        return $q.when({
          'id': 1,
          'type': 'place_photo',
          'placeId': 12,
          'status': 'pending',
          'data': [
            {
              'imageUrl': 'http://sample.com/image.jpg'
            }
          ]
        });

        return $http.get(pdConfig.apiEndpoint + 'client/orders/' + orderId)
          .then(function (response) {
            return response.data;
          });
      },
      updateOrder: function (orderId, updatedData) {
        return $http.put(pdConfig.apiEndpoint + 'client/orders/' + orderId, updatedData)
          .then(function (response) {
            return response.data;
          });
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
      }
    };
  })
;
