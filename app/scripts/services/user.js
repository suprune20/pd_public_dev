'use strict';

angular.module('pdApp')
  .factory('User', function ($http, apiEndpoint, pdYandex, $q) {
    return function () {
      var getProfile = function () {
          return $http.get(apiEndpoint + 'cabinet').then(function (resp) {
            var userProfileData = resp.data;

            userProfileData.places.map(function (placeData) {
              if (placeData.location && (!placeData.location.longitude || !placeData.location.latitude)) {
                placeData.location = null;
              }

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
        getProfile: getProfile,
        getPlaceCoordinates: getPlaceCoordinates
      };
    };
  })
;
