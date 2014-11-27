'use strict';

angular.module('pdFrontend')
  .service('pdFrontendPlacesApi', function ($http, pdConfig) {
    return {
      getPlaceDetails: function (placeId) {
        return $http.get(pdConfig.apiEndpoint + 'client/places/' + placeId)
          .then(function (response) { return response.data; });
      },
      getGraves: function (placeId) {
        return $http.get(pdConfig.apiEndpoint + 'client/places/' + placeId + '/graves')
          .then(function (response) { return response.data; });
      }
    };
  })
;
