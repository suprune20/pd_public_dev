'use strict';

angular.module('pdOms')
  .service('omsPlacesPhotosApi', function ($http, $q, pdConfig) {
    return {
      getPlaces: function (id) {
        return $http
          .get(pdConfig.apiEndpoint + 'oms/photo-places' + (id ? '/' + id : ''), { tracker: 'commonLoadingTracker' })
          .then(function (response) {
            if (_.isEmpty(response.data)) {
              return $q.reject();
            }

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
      processPlace: function (placeId) {
        return omsPlacesPhotosApi.putPlace(placeId, { processed: true });
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
