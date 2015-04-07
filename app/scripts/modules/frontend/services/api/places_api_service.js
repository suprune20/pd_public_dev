'use strict';

angular.module('pdFrontend')
  .service('pdFrontendPlacesApi', function ($http, pdConfig, auth, $q) {
    return {
      getPlaces: function () {
        if (!auth.isAuthenticated()) {
          return $q.when([]);
        }

        return $http.get(pdConfig.apiEndpoint + 'client/places')
          .then(function (response) {
            return _.map(response.data, function (place) {
              place.location = place.location || place.omsData.location;
              place.address = place.address || place.omsData.address;

              return place;
            });
          });
      },
      postPlace: function (name, address, locationLongitude, locationLatitude) {
        return $http.post(pdConfig.apiEndpoint + 'client/places', {
          name: name,
          address: address,
          location: {
            latitude: locationLatitude,
            longitude: locationLongitude
          }
        }).then(function (response) {
          return response.data;
        });
      },
      updatePlace: function (placeId, placeModel) {
        return $http.put(pdConfig.apiEndpoint + 'client/places/' + placeId, {
          name: placeModel.name,
          address: placeModel.address,
          location: {
            latitude: placeModel.location.latitude,
            longitude: placeModel.location.longitude
          }
        }).then(function (response) { return response.data; });
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
      postPlaceDeadman: function (placeId, deadmanModel) {
        return $http.post(pdConfig.apiEndpoint + 'client/places/' + placeId + '/deadmans', deadmanModel)
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
        if (!auth.isAuthenticated()) {
          return $q.when([]);
        }

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
