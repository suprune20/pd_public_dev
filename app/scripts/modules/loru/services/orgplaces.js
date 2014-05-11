'use strict';

angular.module('pdLoru')
  .service('pdLoruStoresApi', function ($http, pdConfig) {
    return {
      getStores: function () {
        return $http.get(pdConfig.apiEndpoint + 'loru/stores', {
          tracker: 'commonLoadingTracker'
        }).then(function (resp) { return resp.data; });
      },
      addStore: function (storeData) {
        return $http.post(pdConfig.apiEndpoint + 'loru/stores', storeData, {
          tracker: 'commonLoadingTracker'
        }).then(function (response) { return response.data; });
      },
      saveStore: function (storeData) {
        return $http.put(pdConfig.apiEndpoint + 'loru/stores/' + storeData.id, storeData, {
          tracker: 'commonLoadingTracker'
        }).then(function (response) { return response.data; });
      },
      removeStore: function (storeId) {
        return $http.delete(pdConfig.apiEndpoint + 'loru/stores/' + storeId, {
          tracker: 'commonLoadingTracker'
        });
      }
    };
  })
  // Factory for Loru orgplaces page with yandex map
  .factory('PdLoruOrgPlaces', function (pdLoruStoresApi, pdYandex) {
    return function () {
      // Initial data
      var storesGeoObjects = [],
        selectedPlaceGeoObject = null,
        originaSelectedStoreGeoObject = null;

      var convertYaGeoObject2Store = function (geoObject) {
          return _.merge(geoObject.properties.placeData, {
            phones: _.pluck(geoObject.properties.placeData.phones, 'phone'),
            location: {
              longitude: geoObject.geometry.coordinates[0],
              latitude: geoObject.geometry.coordinates[1]
            }
          });
        },
        prepareStoreData = function (storeData) {
          storeData.phones = _.map(storeData.phones, function (phoneNumber) {
            return { phone: phoneNumber };
          });

          return storeData;
        },
        createPlacemark = function (coords) {
          return {
            geometry: {
              type: 'Point',
              coordinates: coords
            },
            properties: {
              placeData: {}
            },
            options: {
              draggable: true
            }
          };
        },
        getAddress = function (coords) {
          pdYandex.reverseGeocode(coords).then(function (res) {
            selectedPlaceGeoObject.properties.placeData.address = res.text;
          });
        },
        findStoreGeoObject = function (storeId) {
          return _.find(storesGeoObjects, function (geoObject) {
            return storeId === geoObject.properties.placeData.id;
          });
        },
        getYaGeoObjectFromStore = function (storeData) {
          return {
            geometry: {
              type: 'Point',
              coordinates: [storeData.location.longitude, storeData.location.latitude]
            },
            properties: {
              placeData: storeData
            },
            options: {
              preset: 'twirl#brownIcon'
            }
          };
        },
        getYaGeoObjectsFromStores = function (storesData) {
          return _.map(storesData, function (storeData) {
            return getYaGeoObjectFromStore(storeData);
          });
        }
      ;

      // Get stores from api when created
      pdLoruStoresApi.getStores()
        .then(function (storesData) {
          storesData = _.map(storesData, function (storeData) {
            return prepareStoreData(storeData);
          });
          storesGeoObjects = getYaGeoObjectsFromStores(storesData);
        });

      // Public methods
      return {
        getStoresGeoObjects: function () {
          return storesGeoObjects;
        },
        getSelectedPlaceGeoObject: function () {
          return selectedPlaceGeoObject;
        },
        cancelEdit: function () {
          // Cancel edit of exists store point
          if (selectedPlaceGeoObject.properties.placeData.id) {
            originaSelectedStoreGeoObject.options.visible = true;
          }

          selectedPlaceGeoObject = null;
        },
        addStoreYaMapEvent: function (event) {
          var coords = event.get('coords');

          if (selectedPlaceGeoObject) {
            selectedPlaceGeoObject.geometry.coordinates = coords;
          } else {
            selectedPlaceGeoObject = createPlacemark(coords);
          }

          getAddress(coords);
        },
        selectGeoObjectEvent: function (event) {
          if (originaSelectedStoreGeoObject) {
            originaSelectedStoreGeoObject.options.visible = true;
          }

          originaSelectedStoreGeoObject = findStoreGeoObject(event.get('target').properties.get('placeData.id'));

          selectedPlaceGeoObject = _.cloneDeep(originaSelectedStoreGeoObject);
          selectedPlaceGeoObject.options.preset = 'twirl#blueIcon';
          originaSelectedStoreGeoObject.options.visible = false;
        },
        selectedGeoObjectDragendEvent: function (event) {
          getAddress(event.get('target').geometry.getCoordinates());
          selectedPlaceGeoObject.geometry.coordinates = event.get('target').geometry.getCoordinates();
        },
        addNewStoreFromSelected: function () {
          return pdLoruStoresApi.addStore(convertYaGeoObject2Store(selectedPlaceGeoObject))
            .then(function (addedGeoObject) {
              selectedPlaceGeoObject = null;
              storesGeoObjects.push(getYaGeoObjectFromStore(addedGeoObject));

              return addedGeoObject;
            });
        },
        saveSelectedStore: function () {
          return pdLoruStoresApi.saveStore(convertYaGeoObject2Store(selectedPlaceGeoObject))
            .then(function (savedStoreData) {
              // Change data in places geo objects
              storesGeoObjects.forEach(function (geoObject) {
                if (savedStoreData.id === geoObject.properties.placeData.id) {
                  var savedStoreGeoObject = getYaGeoObjectFromStore(prepareStoreData(savedStoreData));

                  geoObject.geometry = savedStoreGeoObject.geometry;
                  geoObject.properties = savedStoreGeoObject.properties;
                  geoObject.options.visible = true;
                }
              });
              // Reset selected place geo object
              selectedPlaceGeoObject = null;

              return savedStoreData;
            });
        },
        removeSelectedStore: function () {
          return pdLoruStoresApi.removeStore(selectedPlaceGeoObject.properties.placeData.id)
            .then(function () {
              // Also remove from geo objects markers array
              _.remove(storesGeoObjects, function (geoObject) {
                return geoObject.properties.placeData.id === selectedPlaceGeoObject.properties.placeData.id;
              });
              selectedPlaceGeoObject = null;
            });
        },
        addPhone2SelectedStore: function () {
          if (!selectedPlaceGeoObject.properties.placeData.phones) {
            selectedPlaceGeoObject.properties.placeData.phones = [];
          }

          selectedPlaceGeoObject.properties.placeData.phones.push({phone: ''});
        },
        removePhoneFromSelectedStore: function (phoneObj) {
          _.remove(selectedPlaceGeoObject.properties.placeData.phones, phoneObj);
        }
      };
    };
  })
;
