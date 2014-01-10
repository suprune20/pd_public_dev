'use strict';

angular.module('pdApp')
  .factory('User', function ($http, apiEndpoint) {
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
      };

      return {
        getProfile: getProfile
      };
    };
  })
;
