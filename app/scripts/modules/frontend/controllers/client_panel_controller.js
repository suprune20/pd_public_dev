'use strict';

angular.module('pdFrontend')
  .controller('ClientPanelCtrl', function ($scope, user, pdFrontendOrders, growl) {
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
      delete userData.places;
      $scope.userData = userData;

      user.getAllPlaces().then(function (placesCollection) {
        $scope.userData.places = placesCollection;
        // Select first place by default
        if ($scope.userData.places.length) {
          $scope.selectPlace($scope.userData.places[0]);
        }
      });
    });

    $scope.availablePerformers = [];
    $scope.availablePerformerLoading = [];
    $scope.getPhotoPerformers = function (place) {
      // Hide performers list if already showed
      if ($scope.availablePerformers[place.id]) {
        delete $scope.availablePerformers[place.id];
        return;
      }

      $scope.availablePerformerLoading[place.id] = true;
      pdFrontendOrders.getAvailablePerformersForPhoto(place.id, place.location)
        .then(function (performers) {
          $scope.availablePerformers[place.id] = performers;
        })
        .finally(function () {
          $scope.availablePerformerLoading[place.id] = false;
        });
    };
    // Place order
    $scope.order = function (orderType, placeData, performer) {
      pdFrontendOrders.createOrder({
        type: orderType,
        performerId: performer.id,
        placeId: placeData.id,
        location: placeData.location
      })
        .then(function () {
          delete $scope.availablePerformers[placeData.id];
          growl.addSuccessMessage('Заказ был успешно размещен');
        }, function () {
          growl.addErrorMessage('Произошла ошибка при размещении заказа');
        });
    };
  })
;
