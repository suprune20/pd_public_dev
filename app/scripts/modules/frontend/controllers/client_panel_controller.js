'use strict';

angular.module('pdFrontend')
  .controller('ClientPanelCtrl', function ($scope, user, pdFrontendOrders, growl, $modal) {
    $scope.selectPlace = function (placeData) {
      // reset icons
      _.map($scope.placesPoints, function (point) {
        point.options.preset = 'twirl#brownIcon';
      });
      // find selected place and centered and change icon for marker
      var selectedPlace = _.find($scope.placesPoints, {properties: {placeModel: {id: placeData.id}}});
      selectedPlace.options.preset = 'twirl#blueIcon';
      $scope.centerYaPoint = selectedPlace.geometry.coordinates;
    };
    user.getPlaces().then(function (userData) {
      delete userData.places;
      $scope.userData = userData;

      user.getAllPlaces().then(function (placesCollection) {
        $scope.userData.places = placesCollection;
        $scope.placesPoints = _.map($scope.userData.places, function (place) {
          return {
            geometry: {
              type: 'Point',
              coordinates: [place.location.longitude, place.location.latitude]
            },
            properties: {
              placeModel: place
            },
            options: {
              preset: 'twirl#brownIcon'
            }
          };
        });
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

    $scope.confirmOrder = function (orderType, placeData, performer) {
      $modal.open({
        templateUrl: 'views/modules/frontend/client/confirm_order.modal.html',
        controller: function ($scope, pdFrontendOrders, $modalInstance) {
          $scope.performer = performer;
          // Place order
          $scope.confirmOrder = function (comment) {
            pdFrontendOrders.createOrder({
              type: orderType,
              performerId: performer.id,
              placeId: placeData.id,
              location: placeData.location,
              comment: comment
            })
              .then(function () {
                growl.addSuccessMessage('Заказ был успешно размещен');
                $modalInstance.dismiss();
              }, function () {
                growl.addErrorMessage('Произошла ошибка при размещении заказа');
              });
          };
        }
      });
    };
  })
;
