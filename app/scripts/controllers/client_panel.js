'use strict';

angular.module('pdApp')
  .controller('ClientPanelCtrl', function ($scope, User) {
    var user = new User();

    user.getProfile().then(function (userData) {
      $scope.userData = userData;
      $scope.yaPlacesPoints = userData.places.map(function (placeData) {
        return {
          geometry: {
            type: 'Point',
            coordinates: [placeData.location.longitude, placeData.location.latitude]
          }
        };
      });
    });
    $scope.selectPlace = function (placeData) {
      $scope.selectedPlace = placeData;
      $scope.placesMapCenter = [placeData.location.longitude, placeData.location.latitude];
    };
  })
;
