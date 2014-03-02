'use strict';

angular.module('pdFrontend')
  .controller('ClientPanelCtrl', function ($scope, User) {
    var user = new User();

    $scope.selectPlace = function (placeData) {
      if (placeData === $scope.selectedPlace) {
        return;
      }

      $scope.selectedPlace = placeData;
      $scope.yaPlacePoint = null;

      user.getPlaceCoordinates(placeData).then(function (coordinates) {
        $scope.yaPlacePoint = {
          geometry: {
            type: 'Point',
            coordinates: coordinates
          }
        };
      });
    };
    user.getPlaces().then(function (userData) {
      $scope.userData = userData;

      // Select first place by default
      if (userData.places.length) {
        $scope.selectPlace(userData.places[0]);
      }
    });
  })
;
