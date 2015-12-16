'use strict';

angular.module('pdFrontend')
  .service('pdFrontendPlacesApi', function ($http, pdConfig, $filter) {
    return {
      getPlaces: function () {
        return $http.get(pdConfig.apiEndpoint + 'client/places')
          .then(function (response) {
            return _.map(response.data, function (place) {
              if (place.omsData) {
                var omsLocation = place.omsData.location;
                var omsAddress = place.omsData.address;
              }

              place.location = place.location || omsLocation || null;
              place.address = place.address || omsAddress || '';

              return place;
            });
          });
      },
      getPlaceDetails: function (placeId) {
        return $http.get(pdConfig.apiEndpoint + 'client/places/' + placeId)
          .then(function (response) {
            var place = response.data;
            place.location = place.location || place.omsData.location;
            place.address = place.address || place.omsData.address;

            return place;
          });
      },
      getPlaceDeadmans: function (placeId) {
        return $http.get(pdConfig.apiEndpoint + 'client/places/' + placeId + '/deadmans')
          .then(function (response) { return response.data; });
      },
      getPlaceAttachments: function (placeId) {
        return $http.get(pdConfig.apiEndpoint + 'client/places/' + placeId + '/attachments')
          .then(function (response) { return response.data; });
      },
      getPlaceOrders: function (placeId) {
        return $http.get(pdConfig.apiEndpoint + 'client/places/' + placeId + '/orders')
          .then(function (response) { return response.data; });
      },
      getDeadmans: function (params) {
        return $http.get(pdConfig.apiEndpoint + 'client/deadmans', {params: params})
          .then(function (response) {
            return _.map(response.data, function (deadman) {
              deadman.fio = _.filter([deadman.lastName, deadman.middleName, deadman.firstName]).join(' ');

              return deadman;
            });
          });
      }
    };
  })
;
