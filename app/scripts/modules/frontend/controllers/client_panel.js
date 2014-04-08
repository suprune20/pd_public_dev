'use strict';

angular.module('pdFrontend')
  .controller('ClientPanelCtrl', function ($scope, $modal, user, Burial) {
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
    // Open modal window with burial details and memory page data
    $scope.showMemoryPage = function (burialId) {
      var burial = new Burial(burialId);
      $modal.open({
        templateUrl: 'views/modules/frontend/client/memory_page.modal.html',
        controller: 'pdFrontendMemoryModalCtrl',
        windowClass: 'burial-memory-modal',
        resolve: {
          memoryData: function () {
            return burial.getMemoryDetails();
          }
        }
      });
    };
  })
  .controller('pdFrontendMemoryModalCtrl', function ($scope, memoryData) {
    $scope.burialData = memoryData;
    $scope.memoriesList = null;
    $scope.saveBurialData = function (burialData) {
      console.log(burialData);
    };
    $scope.saveCommonText = function (commonText) {
      return $scope.saveBurialData({commonText: commonText});
    };
  })
;
