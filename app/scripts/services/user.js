'use strict';

angular.module('pdApp')
  .factory('User', function ($http) {
    return function () {
      var getProfile = function () {
        return $http.get('http://pd2cat.bsuir.by/api/cabinet', {
            withCredentials: true
          }).then(function (resp) {
            var userProfileData = resp.data;

            userProfileData.places.map(function (placeData) {
              if (!placeData.location.longitude || !placeData.location.latitude) {
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
