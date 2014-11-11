'use strict';

angular.module('pdFrontend')
  .controller('ClientPanelCtrl', function ($scope, user, pdFrontendOrders) {
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

    $scope.availablePerformers = [];
    $scope.availablePerformerLoading = [];
    $scope.getPhotoPerformers = function (place) {
      $scope.availablePerformerLoading[place.id] = true;
      pdFrontendOrders.getAvailablePerformersForPhoto(place.id, place.location)
        .then(function (performers) {
          $scope.availablePerformers[place.id] = performers;
        })
        .finally(function () {
          $scope.availablePerformerLoading[place.id] = false;
        });
    };
    $scope.order = function () {alert('comming soon');};
  })
;
