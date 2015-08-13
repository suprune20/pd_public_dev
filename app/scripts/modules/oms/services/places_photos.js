'use strict';

angular.module('pdOms')
  .service('omsPlacesPhotosApi', function ($http, pdConfig) {
    return {
      getPlaces: function (id) {
        return $http
          .get(pdConfig.apiEndpoint + 'oms/photo-places' + (id ? '/' + id : ''), { tracker: 'commonLoadingTracker' })
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
      getPlace: function (id) {
        return omsPlacesPhotosApi.getPlaces(id);
      },
      unlockPlace: function (placeId) {
        return omsPlacesPhotosApi.putPlace(placeId, { unlocked: true });
      },
      remakePlacePhoto: function (placeId, comment) {
        return omsPlacesPhotosApi.putPlace(placeId, {
          remakePhoto: true,
          remakePhotoComment: comment
        });
      }
    };
  })
;
