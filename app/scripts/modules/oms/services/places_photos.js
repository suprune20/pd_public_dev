'use strict';

angular.module('pdOms')
  .service('omsPlacesPhotosApi', function ($http, pdConfig) {
    return {
      getPlaces: function () {
        return $http
          .get(pdConfig.apiEndpoint + 'oms/photo-places', { tracker: 'commonLoadingTracker' })
          .then(function (response) {
            return response.data;
          });
      },
      putPlace: function (placeId, data) {
        return $http
          .put(pdConfig.apiEndpoint + 'oms/photo-places/' + placeId, data || {}, { tracker: 'commonLoadingTracker' })
          .then(function (response) {
            return response.data;
          });
      }
    };
  })

  .service('omsPlacesPhotos', function (omsPlacesPhotosApi) {
    return {
      getPlace: function () {
        return omsPlacesPhotosApi.getPlaces();
      },
      unlockPlace: function (placeId) {
        return omsPlacesPhotosApi.putPlace(placeId, { unlocked: true });
      },
      remakePlacePhoto: function (placeId) {
        return omsPlacesPhotosApi.putPlace(placeId, { remakePhoto: true });
      }
    };
  })
;
