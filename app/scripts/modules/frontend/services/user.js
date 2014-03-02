'use strict';

angular.module('pdFrontend')
  .factory('User', function ($http, pdConfig, pdYandex, $q) {
    return function () {
      var getPlaces = function () {
          return $http.get(pdConfig.apiEndpoint + 'cabinet', {
            tracker: 'commonLoadingTracker'
          }).then(function (resp) {
            var userProfileData = resp.data;

            userProfileData.places.map(function (placeData) {
              if (placeData.location && (!placeData.location.longitude || !placeData.location.latitude)) {
                placeData.location = null;
              }

              // Sort and formatting gallery data for fancybox
              placeData.gallery = _(placeData.gallery)
                .sortBy('addedAt')
                .map(function (galleryItem) {
                  galleryItem.href = galleryItem.photo;
                  galleryItem.title = galleryItem.addedAt;

                  return galleryItem;
                })
                .value()
              ;
              placeData.mainPhoto = _.first(placeData.gallery);

              return placeData;
            });

            return userProfileData;
          });
        },
        getPlaceCoordinates = function (placeData) {
          var deferred = $q.defer();

          if (placeData.location) {
            deferred.resolve([placeData.location.longitude, placeData.location.latitude]);
          } else if (placeData.address) {
            pdYandex.geocode(placeData.address).then(deferred.resolve, deferred.reject);
          } else {
            deferred.reject('Wrong place data: no location and address attributes');
          }

          return deferred.promise;
        }
      ;

      return {
        getPlaces: getPlaces,
        getPlaceCoordinates: getPlaceCoordinates
      };
    };
  })
;
