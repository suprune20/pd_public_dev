'use strict';

angular.module('pdFrontend')
  .controller('ClientPanelCtrl', function ($scope, placesData, pdFrontendOrders, growl, $modal, placeDetailsState) {
    $scope.placeDetailsState = placeDetailsState;
    $scope.placesCollection = placesData.places;
    $scope.placesPoints = placesData.placesYandexPoints;
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

    $scope.addPlace = function () {
      $modal.open({
        templateUrl: 'views/modules/frontend/client/places/add_place.modal.html',
        controller: function () {}
      });
    };
  })
  .controller('ClientPlaceDetail', function ($state, $modal, placeData, placesListState) {
    $modal.open({
      templateUrl: 'views/modules/frontend/client/places/details.modal.html',
      controller: function ($scope) {
        $scope.placeData = placeData;
      }
    }).result.catch(function () { $state.go(placesListState); });
  })
;
