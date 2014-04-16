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
          burial: function () {
            return burial;
          },
          memoryData: function () {
            return burial.getMemoryDetails();
          }
        }
      });
    };
  })
  .controller('pdFrontendMemoryModalCtrl', function ($scope, burial, memoryData, growl) {
    // Initial values
    $scope.postMemoryData = {};

    $scope.burialData = memoryData;
    $scope.memoriesDataProvider = new (burial.getMemoriesProvider())();
    $scope.saveBurialData = function (burialData) {
      console.log(burialData);
    };
    $scope.saveCommonText = function (commonText) {
      return $scope.saveBurialData({commonText: commonText});
    };
    $scope.onGalleryFileSelect = function (files) {
      burial.postGalleryPhoto(files[0])
        .then(null, function () {
          growl.addErrorMessage('Не удалось добавить изображение в галерею');
        });
    };
    // Post memory message
    $scope.onMemoryFileSelect = function (files, type) {
      console.log(files, type);
      $scope.postMemoryData.file = {
        type: type,
        file: files[0]
      };
    };
    $scope.removeSelectedMessageFile = function () {
      delete $scope.postMemoryData.file;
    };
    $scope.postMemoryMsg = function () {
      console.log($scope.postMemoryData);
      // Reset form data after success save
      $scope.postMemoryData = {};
    };
  })
;
