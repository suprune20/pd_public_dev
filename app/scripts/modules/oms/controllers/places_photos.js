'use strict';

angular.module('pdOms')
  .controller('OmsPlacesPhotosCtrl', function ($stateParams, $scope, $q,
      $filter, growl, omsPlacesPhotos, omsBurials, pdTypeahead
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

          $scope.place = placeData;
          $scope.showAddBurialForm = true;

          if (placeData.gallery.length) {
            $scope.showImage(placeData.gallery[0]);
          }
        }, function (errorResponse) {
          var errorData = errorResponse.data;
          var errorMessage = 'Произошла ошибка при получении данных';

          if (400 === errorResponse.status) {
            errorMessage = errorData.message;
          }

          growl.addErrorMessage(errorMessage, { ttl: -1 });

          return $q.reject(errorResponse);
        })
        .finally(function () {
          $scope.initialLoaded = true;
          $scope.unprocessedPhotosCount = null;
        });
    };

    // Initial load place photo data
    getPlaceData($stateParams.placeId);

    $scope.showImage = function (imageUrl) {
      $scope.imageData = {
        thumb: $filter('pdThumbnail')(imageUrl, '500x500'),
        small: $filter('pdThumbnail')(imageUrl, '500x500'),
        large: $filter('pdThumbnail')(imageUrl, '1200x1200')
      };
    };

    $scope.addBurial = function () {
      if ($scope.isRequestSent) {
        return;
      }

      var burialPromise = $scope.burialFormData.id ?
        omsBurials.saveBurial($scope.burialFormData.id, $scope.burialFormData) :
        omsBurials.createBurial($scope.burialFormData);

      $scope.isRequestSent = true;
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
        })
        .finally(function () {
            $scope.isRequestSent = false
        });
    };

    $scope.onEditBurialBtnClick = function (burial) {
      $scope.burialFormData = _.clone(burial);
      $scope.showAddBurialForm = true;
    };

    $scope.getNextUnprocessedPlace = function () {
      if ($scope.remakePhoto) {
        return omsPlacesPhotos
          .remakePlacePhoto($scope.place.id, $scope.remakePhotoComment)
          .then(function () {
            $scope.remakePhoto = false;
            $scope.remakePhotoComment = '';
            $scope.showAddBurialForm = false;
          }, function () {
            growl.addErrorMessage('Произошла ошибка при установке флага Перефотографировать');

            return $q.reject();
          })
          .finally(function () {
            return getPlaceData();
          });
      }

      return omsPlacesPhotos
        .processPlace($scope.place.id)
        .then(function () {
          $scope.showAddBurialForm = false;
        }, function () {
          growl.addErrorMessage('Произошла ошибка при разблокировке места');
        })
        .finally(function () {
          return getPlaceData();
        });
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

    $scope.getUnprocessedPhotosCount = function () {
      omsPlacesPhotos.getUnprocessedPhotosCount()
        .then(function (count) { $scope.unprocessedPhotosCount = count; });
    };
  })
;
