'use strict';

angular.module('pdOms')
  .controller('OmsPlacesPhotosCtrl', function ($scope, $q, growl, omsPlacesPhotos, omsBurials) {
    var getPlaceData = function () {
      return omsPlacesPhotos.getPlace()
        .then(function (placeData) {
          $scope.place = placeData;
        });
    };

    // Initial load place photo data
    getPlaceData();

    $scope.showImage = function (imageUrl) {
      $scope.titleImage = imageUrl;
    };

    $scope.addBurial = function () {
      $scope.burialData.placeId = $scope.place.id;
      omsBurials.createBurial($scope.burialData)
        .then(function (addedBurial) {
          $scope.place.burials.push(addedBurial);
          $scope.showAddBurialForm = false;
          delete $scope.burialData;
          delete $scope.formError;
        }, function (error) {
          $scope.formError = error;
        });
    };

    $scope.getNextPlace = function () {
      var getNextPlace = function () {
        return omsPlacesPhotos
          .unlockPlace($scope.place.id)
          .then(function () {
            $scope.showAddBurialForm = false;
            delete $scope.titleImage;

            return getPlaceData();
          }, function () {
            growl.addErrorMessage('Произошла ошибка при разблокировке места');
          });
      };

      if ($scope.remakePhoto) {
        omsPlacesPhotos
          .remakePlacePhoto($scope.place.id)
          .then(function () {
            return getNextPlace();
          }, function () {
            growl.addErrorMessage('Произошла ошибка при установке флага Перефотографировать');

            return $q.reject();
          });

        return;
      }

      getNextPlace();
    };
  })
;
