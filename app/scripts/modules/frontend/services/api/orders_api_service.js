'use strict';

angular.module('pdFrontend')
  .service('pdFrontendOrderApi', function ($http, pdConfig, $timeout) {
    return {
      getAvailablePerformers: function (type, placeId, location) {
        console.log(type, placeId);
        return $http.get(pdConfig.apiEndpoint + 'client/available_performers', {
          params: {
            type: type,
            placeId: placeId,
            'location[latitude]': location.latitude,
            'location[longitude]': location.longitude
          }
        }).then(function (response) {
          return $timeout(function () {
            return [
              {
                'id': 32,
                'name': 'Бюро добрых услуг',
                'price': 234.32
              },
              {
                'id': 33,
                'name': 'Бюро не добрых услуг',
                'price': 255.66
              }
            ];
          }, 1000);

          return response.data;
        });
      }
    };
  })
;
