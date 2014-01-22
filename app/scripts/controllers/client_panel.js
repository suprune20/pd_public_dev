'use strict';

angular.module('pdApp')
  .controller('ClientPanelCtrl', function ($scope, User) {
    var user = new User();

    $scope.selectPlace = function (placeData) {
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
    user.getProfile().then(function (userData) {
      $scope.userData = userData;

      // Select first place by default
      if (userData.places.length) {
        $scope.selectPlace(userData.places[0]);
      }
    });
  })
;
