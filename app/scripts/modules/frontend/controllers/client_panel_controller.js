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
      $modal.open({
        templateUrl: 'views/modules/frontend/client/places/add_place.modal.html',
        resolve: {
          onAddedPlace: ['pdFrontendClientPanel', function (pdFrontendClientPanel) {
            return function (placeModel) {
              $scope.placesPoints.push(pdFrontendClientPanel.getPlaceYandexPoint(placeModel));
              $scope.placesCollection.push(placeModel);
            };
          }]
        },
        controller: 'AddPlaceModalCtrl'
      });
    };

    // Handle addedDeadman event
    $scope.$on('addedDeadman', function (event, eventData) {
      var place = _.findWhere($scope.placesCollection, {id: eventData.placeId});
      if (!place) {
        return;
      }

      place.deadmans.push(eventData.deadman);
    });

    // Handle modify place data event
    $scope.$on('place:updated_data', function (event, eventData) {
      var place = _.findWhere($scope.placesCollection, {id: eventData.id});
      if (!place) {
        return;
      }

      place.address = eventData.address;
    });
  })

  .controller('AddPlaceModalCtrl', function ($scope, pdYandex, pdFrontendClientPanel, $modalInstance, onAddedPlace) {
    $scope.$watch('currentPlaceMarker.geometry', function (geometry) {
      if (!geometry) {
        return;
      }

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
          onAddedPlace(placeModel);
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
              deadmans: $scope.predefinedDeadmans ? $scope.predefinedDeadmans : []
            }
          },
          geometry: {
            type: 'Point',
            coordinates: [geolocation.longitude, geolocation.latitude]
          },
          options: {}
        };
      });
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




  .controller('ClientPlaceDetailsModalCtrl', function ($rootScope, $scope, placeModel, $modal, DeadmanMemoryProvider,
                                                       pdFrontendClientPanel, pdFrontendOrders, pdYandex, growl
  ) {
    $scope.placeData = placeModel;
    $scope.addDeadman = function (deadman) {
      pdFrontendClientPanel.addDeadman(placeModel.id, deadman)
        .then(function (addedDeadman) {
          $scope.placeData.deadmans.push(addedDeadman);
          $rootScope.$broadcast('addedDeadman', {
            placeId: placeModel.id,
            deadman: addedDeadman
          });
        });
    };

    // Open modal window with burial details and memory page data
    $scope.showMemoryPage = function (deadmanId) {
      var deadmanMemory = new DeadmanMemoryProvider(deadmanId);

      $modal.open({
        templateUrl: 'views/modules/frontend/client/memory_page.modal.html',
        windowClass: 'burial-memory-modal',
        resolve: {
          deadmanProvider: function () {
            return deadmanMemory;
          },
          memoryData: function () {
            return deadmanMemory.getPersonDetails();
          },
          MemoriesProvider: function () {
            return deadmanMemory.getMemoriesProvider();
          }
        },
        controller: 'MemoryPageCtrl'
      });
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
        controller: function ($scope, pdFrontendOrders, growl, $modalInstance) {
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
                placeModel.updateOrders();
                $modalInstance.dismiss();
              }, function () {
                growl.addErrorMessage('Произошла ошибка при размещении заказа');
              });
          };
        }
      });
    };


    $scope.$watch('placeData.locationYandexPoint.geometry', function (geometry) {
      if (!geometry) {
        return;
      }

      pdYandex.reverseGeocode(geometry.coordinates).then(function (res) {
        $scope.placeData.address = res.text;
        $scope.placeData.location = {
          longitude: geometry.coordinates[0],
          latitude: geometry.coordinates[1]
        };
      });
    }, true);

    $scope.savePlace = function () {
      pdFrontendClientPanel.savePlace($scope.placeData)
        .then(function (updatedPlaceData) {
          $rootScope.$broadcast('place:updated_data', updatedPlaceData);
          growl.addSuccessMessage('Данные места были успешно сохранены');
        });
    };
    $scope.yaMapClickHandle = function (event) {
      $scope.placeData.locationYandexPoint.geometry.coordinates = event.get('coords');
    };
  })

  .controller('MemoryPageCtrl', function ($scope, deadmanProvider, MemoriesProvider, memoryData, pdFrontendClientPanel,
                                          growl, $q, $modal, $rootScope
  ) {
    // Initial values
    $scope.postMemoryData = {};

    $scope.burialData = memoryData;
    $scope.memoriesDataProvider = new MemoriesProvider();

    $scope.saveBurialData = function (burialData) {
      delete $scope.editBurialFormError;

      return deadmanProvider.updatePersonDetails(burialData)
        .then(function (updatedPersonData) {
          $scope.burialData = updatedPersonData;
          $rootScope.$broadcast('updated_person_data', updatedPersonData);
        }, function (errorData) {
          if ('validation_error' === errorData.status) {
            $scope.editBurialFormError = errorData.message;
            return $q.reject();
          }

          growl.addErrorMessage('Произошла ошибка при сохранении данных');

          return $q.reject();
        });
    };

    $scope.onHideBurialDataForm = function () {
      delete $scope.editBurialFormError;
    };

    $scope.saveCommonText = function (commonText) {
      return $scope.saveBurialData({commonText: commonText});
    };

    $scope.onMainPhotoFileSelect = function (files) {
      if (!files.length) {
        return;
      }

      $scope.saveBurialData({
        photo: files[0]
      });
    };

    // Post memory message
    $scope.onMemoryFileSelect = function (files, type) {
      $scope.postMemoryData.file = {
        type: type,
        file: files[0]
      };
    };

    $scope.removeSelectedMessageFile = function () {
      delete $scope.postMemoryData.file;
    };

    $scope.postMemoryMsg = function () {
      var newMemoryRecordModel = {
        type: $scope.postMemoryData.file ? $scope.postMemoryData.file.type : 'text',
        text: $scope.postMemoryData.text
      };

      if ($scope.postMemoryData.file) {
        newMemoryRecordModel.mediaContent = $scope.postMemoryData.file.file;
      }

      $scope.memoriesDataProvider.postMemoryRecord(newMemoryRecordModel)
        .then(function () {
          // Reset form data after success save
          $scope.postMemoryData = {};
        });
    };

    $scope.loadPlacesCollection = function () {
      deadmanProvider.getPlacesCollection()
        .then(function (placesCollection) {
          $scope.places = placesCollection;
        });
    };

    $scope.openPlaceDetailModal = function () {
      $modal.open({
        templateUrl: 'views/modules/frontend/client/places/details.modal.html',
        resolve: {
          placeModel: function () {
            return pdFrontendClientPanel.getPlaceDetails($scope.burialData.placeId);
          }
        },
        controller: 'ClientPlaceDetailsModalCtrl'
      });
    };

    $scope.addNewPlace = function () {
      // define scope for modal with predefined deadman
      var $modalScope = $scope.$new(),
        modalBurialData = angular.copy($scope.burialData);

      modalBurialData.firstName = modalBurialData.firstname;
      modalBurialData.lastName = modalBurialData.lastname;
      modalBurialData.middleName = modalBurialData.middlename;
      modalBurialData.birthData = modalBurialData.dob;
      modalBurialData.deathData = modalBurialData.dod;
      $modalScope.predefinedDeadmans = [modalBurialData];

      $modal.open({
        templateUrl: 'views/modules/frontend/client/places/add_place.modal.html',
        resolve: {
          onAddedPlace: function () {
            return function (placeModel) {
              $scope.burialData.placeId = placeModel.id;
              $scope.saveBurialData({placeId: placeModel.id});
            };
          }
        },
        scope: $modalScope,
        controller: 'AddPlaceModalCtrl'
      });
    };
  })
;
