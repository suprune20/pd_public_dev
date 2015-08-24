'use strict';

angular.module('pdOms')
  .controller('OmsPlacesPhotosCtrl', function ($scope, $q, $filter, growl, omsPlacesPhotos, omsBurials, omsCemeteries,
                                               pdTypeahead
  ) {
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
          $scope.currentPlaceId = placeData.id;

          $scope.showAddBurialForm = true;
          $scope.place = placeData;

          if (placeData.gallery.length) {
            $scope.showImage(placeData.gallery[0]);
          }

          return $q.all([
            omsCemeteries.getCemeteries(),
            omsCemeteries.getCemeteryAreas(placeData.cemetery.id)
          ]).then(function (promisesData) {
            $scope.cemeteries = promisesData[0];
            $scope.areas = promisesData[1];
          });
        })
        .finally(function () {
          $scope.initialLoaded = true;
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

    $scope.getNextUnprocessedPlace = function () {
      var getNextPlace = function () {
        return omsPlacesPhotos
          .processPlace($scope.place.id)
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
      if ($scope.isCurrentFirstPlace()) {
        return;
      }

      var prevPlaceId = $scope.sessionPlaces[$scope.sessionPlaces.indexOf($scope.currentPlaceId) - 1];
      getPlaceData(prevPlaceId)
        .then(function () {
          $scope.currentPlaceId = prevPlaceId;
        });
    };

    $scope.getNextPlace = function () {
      if ($scope.isCurrentLastPlace()) {
        return;
      }

      var nextPlaceId = $scope.sessionPlaces[$scope.sessionPlaces.indexOf($scope.currentPlaceId) + 1];
      getPlaceData(nextPlaceId)
        .then(function () {
          $scope.currentPlaceId = nextPlaceId;
        });
    };

    $scope.isCurrentLastPlace = function () {
      return $scope.currentPlaceId === $scope.sessionPlaces[$scope.sessionPlaces.length - 1];
    };
    $scope.isCurrentFirstPlace = function () {
      return $scope.currentPlaceId === $scope.sessionPlaces[0];
    };

    $scope.getTypeaheadData = function (query, type) {
      return pdTypeahead.getPersonTypeahead(query, type);
    };
  })
;
