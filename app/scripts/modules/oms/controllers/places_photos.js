'use strict';

angular.module('pdOms')
  .controller('OmsPlacesPhotosCtrl', function ($scope, $q, $filter, growl, omsPlacesPhotos, omsBurials) {
    // Initial variables initialize
    $scope.burialFormData = {};
    $scope.showAddBurialForm = true;
    $scope.sessionPlaces = [];

    var getPlaceData = function (id) {
      return omsPlacesPhotos.getPlace(id)
        .then(function (placeData) {
          if (!id) {
            $scope.sessionPlaces.push(placeData.id);
          }

          $scope.initialLoaded = true;
          $scope.showAddBurialForm = true;
          $scope.place = placeData;

          if (placeData.gallery.length) {
            $scope.showImage(placeData.gallery[0]);
          }
        });
    };

    // Initial load place photo data
    getPlaceData();

    $scope.showImage = function (imageUrl) {
      $scope.imageData = {
        thumb: $filter('pdThumbnail')(imageUrl, '500x500'),
        small: $filter('pdThumbnail')(imageUrl, '500x500'),
        large: $filter('pdThumbnail')(imageUrl, '1200x1200')
      };
    };

    $scope.addBurial = function () {
      var burialPromise = $scope.burialFormData.id ?
        omsBurials.saveBurial($scope.burialFormData.id, $scope.burialFormData) :
        omsBurials.createBurial($scope.burialFormData);

      $scope.burialFormData.placeId = $scope.place.id;
      burialPromise
        .then(function (savedBurial) {
          if ($scope.burialFormData.id) {
            $scope.place.burials = _.map($scope.place.burials, function (burial) {
              return savedBurial.id === burial.id ? savedBurial : burial;
            });
          } else {
            $scope.place.burials.push(savedBurial);
          }

          delete $scope.burialFormData;
          delete $scope.formError;
        }, function (errorData) {
          if (!errorData.message) {
            growl.addErrorMessage('Произошла ошибка при добавлении захоронения');

            return;
          }

          $scope.formError = errorData.message;
        });
    };

    $scope.onEditBurialBtnClick = function (burial) {
      $scope.burialFormData = _.clone(burial);
      $scope.showAddBurialForm = true;
    };

    $scope.getNextPlace = function () {
      var getNextPlace = function () {
        return omsPlacesPhotos
          .unlockPlace($scope.place.id)
          .then(function () {
            $scope.showAddBurialForm = false;

            return getPlaceData();
          }, function () {
            growl.addErrorMessage('Произошла ошибка при разблокировке места');
          });
      };

      if ($scope.remakePhoto) {
        omsPlacesPhotos
          .remakePlacePhoto($scope.place.id, $scope.remakePhotoComment)
          .then(function () {
            $scope.remakePhoto = false;
            $scope.remakePhotoComment = '';

            return getNextPlace();
          }, function () {
            growl.addErrorMessage('Произошла ошибка при установке флага Перефотографировать');

            return $q.reject();
          });

        return;
      }

      getNextPlace();
    };

    $scope.getPrevPlace = function () {
      if ($scope.sessionPlaces.length < 2) {
        return;
      }

      getPlaceData($scope.sessionPlaces[$scope.sessionPlaces.length - 2])
        .then(function () {
          $scope.sessionPlaces.splice(-1, 1);
        });
    };
  })
;
