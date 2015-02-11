'use strict';

angular.module('pdFrontend')
  .controller('ClientPanelCtrl', function ($scope, placesData, pdFrontendOrders, growl, $modal, placeDetailsState) {
    $scope.placesCollection = placesData.places;
    $scope.placesPoints = placesData.placesYandexPoints;
    $scope.selectPlace = function (placeData) {
      // reset icons
      _.map($scope.placesPoints, function (point) {
        point.options.preset = 'twirl#brownIcon';
      });
      // find selected place and centered and change icon for marker
      var selectedPlace = _.find($scope.placesPoints, {properties: {placeModel: {id: placeData.id}}});
      if (!selectedPlace) {
        return;
      }

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

    // open place details
    $scope.openPlaceDetails = function (placeModel) {
      if (placeModel.id) {
        $scope.$state.go(placeDetailsState, {placeId: placeModel.id});
        return;
      }

      $modal.open({
        templateUrl: 'views/modules/frontend/client/places/details.modal.html',
        resolve: {
          placeModel: function (pdFrontendClientPanel) {
            placeModel.locationYandexPoint = pdFrontendClientPanel.getPlaceYandexPoint(placeModel);

            return placeModel;
          }
        },
        controller: 'ClientPlaceDetailsModalCtrl'
      });
    };

    $scope.addPlace = function () {
      var $controllerScope = $scope;

      $modal.open({
        templateUrl: 'views/modules/frontend/client/places/add_place.modal.html',
        controller: function ($scope, pdYandex, pdFrontendClientPanel, $modalInstance) {
          $scope.$watch('currentPlaceMarker.geometry', function (geometry) {
            pdYandex.reverseGeocode(geometry.coordinates).then(function (res) {
              $scope.currentPlaceMarker.properties.placeModel.address = res.text;
              $scope.currentPlaceMarker.properties.placeModel.location = {
                longitude: geometry.coordinates[0],
                latitude: geometry.coordinates[1]
              };
            });
          }, true);

          $scope.savePlace = function () {
            pdFrontendClientPanel.addPlace($scope.currentPlaceMarker.properties.placeModel)
              .then(function (placeModel) {
                $controllerScope.placesPoints.push(pdFrontendClientPanel.getPlaceYandexPoint(placeModel));
                $controllerScope.placesCollection.push(placeModel);
                $modalInstance.close();
              });
          };
          $scope.yaMapClickHandle = function (event) {
            $scope.currentPlaceMarker.geometry.coordinates = event.get('coords');
          };
          pdYandex.currentPosition()
            .then(function (geolocation) {
              $scope.currentPlaceMarker = {
                properties: {
                  placeModel: {
                    deadmans: []
                  }
                },
                geometry: {
                  type: 'Point',
                  coordinates: [geolocation.longitude, geolocation.latitude]
                },
                options: {}
              };
            });
        }
      });
    };
  })
  .controller('ClientPlaceDetail', function ($state, $modal, placeData, placesListState) {
    $modal.open({
      templateUrl: 'views/modules/frontend/client/places/details.modal.html',
      resolve: {
        placeModel: function () {
          return placeData;
        }
      },
      controller: 'ClientPlaceDetailsModalCtrl'
    }).result.catch(function () { $state.go(placesListState); });
  })
  .controller('ClientPlaceDetailsModalCtrl', function ($scope, placeModel, $modal, DeadmanMemoryProvider) {
    $scope.placeData = placeModel;
    // Open modal window with burial details and memory page data
    $scope.showMemoryPage = function (burialId) {
      var deadmanMemory = new DeadmanMemoryProvider(burialId);

      $modal.open({
        templateUrl: 'views/modules/frontend/client/memory_page.modal.html',
        windowClass: 'burial-memory-modal',
        resolve: {
          burial: function () {
            return deadmanMemory;
          },
          memoryData: function () {
            return deadmanMemory.getMemoryDetails();
          }
        },
        controller: function ($scope, burial, memoryData, growl) {
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
        }
      });
    };
  })
;
