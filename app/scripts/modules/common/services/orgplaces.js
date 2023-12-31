'use strict';

angular.module('pdCommon')
  .service('pdOrgStoresApi', function ($http, pdConfig) {
    var url = pdConfig.apiEndpoint + 'org/stores';

    return {
      getStores: function () {
        return $http.get(url, {
          tracker: 'commonLoadingTracker'
        }).then(function (resp) { return resp.data; });
      },
      addStore: function (storeData) {
        return $http.post(url, storeData, {
          tracker: 'commonLoadingTracker'
        }).then(function (response) { return response.data; });
      },
      saveStore: function (storeData) {
        return $http.put(url + '/' + storeData.id, storeData, {
          tracker: 'commonLoadingTracker'
        }).then(function (response) { return response.data; });
      },
      removeStore: function (storeId) {
        return $http.delete(url + '/' + storeId, {
          tracker: 'commonLoadingTracker'
        });
      }
    };
  })
  // Factory for orgplaces page with yandex map
  .factory('PdCommonOrgPlaces', function (pdOrgStoresApi, pdYandex, storage) {
    return function () {
      // Constants
      var PD_ORG_PLACESMAP_MAP_TYPE = 'pd.org.places_map_type';

      // Initial data
      var storesGeoObjects = [],
        selectedPlaceGeoObject = null,
        originaSelectedStoreGeoObject = null;

      var convertYaGeoObject2Store = function (geoObject) {
          var storeData = _.clone(geoObject.properties.placeData);
          storeData.phones = _(geoObject.properties.placeData.phones).pluck('phone').filter().value();
          storeData.location = {
            longitude: geoObject.geometry.coordinates[0],
            latitude: geoObject.geometry.coordinates[1]
          };

          return storeData;
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
      pdOrgStoresApi.getStores()
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

          // change locations of store marker if has been selected marker previous
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
          selectedPlaceGeoObject.options.draggable = true;
          originaSelectedStoreGeoObject.options.visible = false;
        },
        selectedGeoObjectDragendEvent: function (event) {
          getAddress(event.get('target').geometry.getCoordinates());
          selectedPlaceGeoObject.geometry.coordinates = event.get('target').geometry.getCoordinates();
        },
        addNewStoreFromSelected: function () {
          return pdOrgStoresApi.addStore(convertYaGeoObject2Store(selectedPlaceGeoObject))
            .then(function (addedGeoObject) {
              selectedPlaceGeoObject = null;
              storesGeoObjects.push(getYaGeoObjectFromStore(prepareStoreData(addedGeoObject)));

              return addedGeoObject;
            });
        },
        saveSelectedStore: function () {
          return pdOrgStoresApi.saveStore(convertYaGeoObject2Store(selectedPlaceGeoObject))
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
          return pdOrgStoresApi.removeStore(selectedPlaceGeoObject.properties.placeData.id)
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
        },
        changedYaMapTypeHandler: function (event) {
          storage.set(PD_ORG_PLACESMAP_MAP_TYPE, event.get('newType'));
        },
        getYaMapType: function () {
          return storage.get(PD_ORG_PLACESMAP_MAP_TYPE);
        }
      };
    };
  })
;
