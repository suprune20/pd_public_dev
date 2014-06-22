'use strict';

angular.module('pdFrontend')
  .service('pdFrontendCatalogApi', function ($http, pdConfig) {
    return {
      getFilters: function () {
        return $http.get(pdConfig.apiEndpoint + 'catalog_filters', {tracker: 'commonLoadingTracker'})
          .then(function (resp) {
            return resp.data;
          });
      },
      getCategories: function () {
        return $http.get(pdConfig.apiEndpoint + 'catalog/categories', {tracker: 'commonLoadingTracker'})
          .then(function (resp) {
            return resp.data.results;
          });
      },
      getSuppliers: function (_categories) {
        return $http.get(pdConfig.apiEndpoint + 'catalog/suppliers', {
          params: {
            categories: _categories
          },
          tracker: 'commonLoadingTracker'
        }).then(function (resp) {
          return resp.data.supplier;
        });
      },
      getProducts: function (paramsData) {
        return $http.get(pdConfig.apiEndpoint + 'catalog/products', {
          params: paramsData,
          tracker: 'commonLoadingTracker'
        }).then(function (resp) {
          return resp.data.results;
        });
      },
      getProduct: function (productId) {
        return $http.get(pdConfig.apiEndpoint + 'catalog/products/' + productId, {
          tracker: 'commonLoadingTracker'
        }).then(function (resp) {
          return resp.data.results[0];
        });
      },
      getPlaces: function (statuses) {
        return $http.get(pdConfig.apiEndpoint + 'catalog/places', {
          params: {
            'filter[status]': _.isArray(statuses) ? statuses : [statuses]
          },
          tracker: 'commonLoadingTracker'
        }).then(function (response) {
          return response.data;
        });
      }
    };
  })
  .factory('Catalog', function ($q, user, pdYandex, pdFrontendCatalogApi) {
    return function (productsCountPerRequest) {
      var SUPPLIER_YA_MARKER_CHECKED_PRESET = 'twirl#darkgreenDotIcon',
        SUPPLIER_YA_MARKER_UNCHECKED_PRESET = 'twirl#darkgreenIcon';
      // Products data provider class
      var ProductsDataProvider = function (productsCountPerRequest) {
        var isBusy = false,
          isNoProducts = false,
          products = [],
          filtersData = {};

        productsCountPerRequest = productsCountPerRequest || 15;

        function getNextProducts() {
          if (isBusy || isNoProducts) {
            return;
          }

          isBusy = true;
          pdFrontendCatalogApi.getProducts(_.merge(filtersData || {}, {
            limit: productsCountPerRequest,
            offset: products.length
          }))
            .then(function (productsData) {
              isBusy = false;
              isNoProducts = productsData.length < productsCountPerRequest;
              products = products.concat(productsData);
            }, function () { isBusy = false; });
        }

        return {
          getNextProducts: getNextProducts,
          isBusy: function () { return isBusy; },
          isNoMoreProducts: function () {
            return isNoProducts && (products.length >= productsCountPerRequest || !products.length);
          },
          getProducts: function () {
            return products;
          },
          // Clear previous filters/products and apply new filters data
          applyFilters: function (_filtersData_, _ordersData) {
            isNoProducts = false;
            filtersData = {};
            _.forEach(_filtersData_, function (value, key) {
              filtersData['filter[' + key + ']'] = value;
            });
            _.forEach(_ordersData, function (value, orderAttr) {
              filtersData['order[' + orderAttr + ']'] = value;
            });
            products = [];
            getNextProducts();
          }
        };
      };
      // Create instance of products data provider class
      var productsDataProvider = new ProductsDataProvider(productsCountPerRequest);

      return {
        getFilters: pdFrontendCatalogApi.getFilters,
        getCategories: pdFrontendCatalogApi.getCategories,
        getProduct: pdFrontendCatalogApi.getProduct,
        productsDataProvider: productsDataProvider,
        getYaMapPoints: function getYaMapPointsData(suppliersCategories) {
          return $q.all([user.getPlaces(), pdFrontendCatalogApi.getSuppliers(suppliersCategories)])
            .then(function (promiseData) {
              var points = [],
                userPlacesData = promiseData[0].places || [],
                suppliersData = promiseData[1];

              // Add user's places point
              _.forEach(userPlacesData, function (place) {
                if (!place.location) {
                  return;
                }

                points.push({
                  properties: {
                    type: 'users_place',
                    pointData: place
                  },
                  geometry: {
                    type: 'Point',
                    coordinates: [place.location.longitude, place.location.latitude]
                  },
                  options: {
                    visible: true,
                    preset: 'twirl#greyIcon'
                  }
                });
              });
              // Add suppliers places points
              _.forEach(suppliersData, function (supplier) {
                if (!supplier.location || !supplier.stores.length) {
                  return;
                }

                // ToDo: now removed suppliers without categories
                if (!supplier.categories.length) {
                  return;
                }

                supplier.stores.forEach(function (storeData) {
                  storeData.categories = supplier.categories;
                  points.push({
                    properties: {
                      type: 'supplier_store_place',
                      pointData: storeData,
                      active: true
                    },
                    options: {
                      preset: SUPPLIER_YA_MARKER_CHECKED_PRESET,
                      visible: true
                    },
                    geometry: {
                      type: 'Point',
                      coordinates: [storeData.location.longitude, storeData.location.latitude]
                    }
                  });
                });
              });

              return {
                allPoints: points,
                userPlacesPoints: userPlacesData,
                suppliersPoints: suppliersData
              };
            });
        },
        toggleSupplierYaMarker: function (supplierGeoObject) {
          supplierGeoObject.options
            .set('preset', SUPPLIER_YA_MARKER_CHECKED_PRESET === supplierGeoObject.options.get('preset') ?
                SUPPLIER_YA_MARKER_UNCHECKED_PRESET :
                SUPPLIER_YA_MARKER_CHECKED_PRESET);
          supplierGeoObject.properties.set('active', !supplierGeoObject.properties.get('active'));
        },
        getUsersPlacesBounds: function (usersPoints) {
          return pdYandex.getBoundsByPoints(_.map(usersPoints, function (point) {
            return {
              latitude: point.location.latitude,
              longitude: point.location.longitude
            };
          }));
        },
        filterSuppliersByCategories: function (geoObjects, categories) {
          return _.map(geoObjects, function (geoObject) {
            if ('supplier_store_place' === geoObject.properties.type) {
              geoObject.options.visible = !!_.intersection(categories, geoObject.properties.pointData.categories).length;
            }

            return geoObject;
          });
        }
      };
    };
  })
  .factory('CatalogUnownedPlaces', function (pdFrontendCatalogApi) {
    return function () {
      var placesGeoObjects = [],
        selectedPlacesGallery = [];

      // Get unowned places data and convert into geo objects when create instance
      pdFrontendCatalogApi.getPlaces(['dt_unowned', 'dt_unindentified'])
        .then(function (placesData) {
          placesGeoObjects = _.map(placesData, function (place) {
            return {
              properties: {
                type: 'unidentified_place',
                pointData: place
              },
              options: {
                iconImageHref: 'images/redCircleDotIcon.png',
                iconImageSize: [5, 5],
                iconImageOffset: [-2.5, -2.5],
                iconContentOffset: [-2.5, -2.5],
                iconContentSize: [10, 10]
              },
              geometry: {
                type: 'Point',
                coordinates: [place.location.longitude, place.location.latitude]
              }
            };
          });
        });

      return {
        getPlacesGeoObjects: function () {
          return placesGeoObjects;
        },
        selectorPolygonGeoObject: {
          geometry: {
            type: 'Polygon',
            coordinates: []
          },
          options: {
            editorDrawingCursor: 'crosshair'
          }
        },
        getSelectedPlacesGallery: function () {
          return selectedPlacesGallery;
        },
        filterPlacesBySelectorYaHandler: function (event) {
          // Reset current gallery before filter
          selectedPlacesGallery = [];

          var polygonGeoObject = event.get('target');
          if (!polygonGeoObject.geometry.getBounds()) {
            return;
          }

          ymaps.geoQuery(polygonGeoObject.getMap().geoObjects).searchIntersect(polygonGeoObject)
            .search('properties.type = "unidentified_place"')
            .each(function (geoObject) {
              selectedPlacesGallery = selectedPlacesGallery.concat(geoObject.properties.get('pointData').photos);
            });
        }
      };
    };
  })
  .factory('CatalogMyPlaces', function (pdYandex, user, growl, $rootScope) {
    return function () {
      var MARKER_CURRENT_MARKER_PRESET = 'twirl#redIcon',
        MARKER_PLACE_PRESET = 'twirl#greyIcon';
      var currentPlaceGeoObject,
        placeFormError;

      var createPlacemark = function (coords, placeData) {
          return {
            geometry: {
              type: 'Point',
              coordinates: placeData ? [placeData.location.longitude, placeData.location.latitude] : coords
            },
            properties: {
              type: 'users_place',
              placeData: placeData || {}
            },
            options: {
              preset: MARKER_CURRENT_MARKER_PRESET,
              draggable: true
            }
          };
        },
        getPlacemarkFromYaGeoObject = function (yaGeoObject) {
          return createPlacemark(null, _.cloneDeep(yaGeoObject.properties.get('placeData')));
        },
        getAddress = function (coords) {
          pdYandex.reverseGeocode(coords).then(function (res) {
            currentPlaceGeoObject.properties.placeData.address = res.text;
          });
        },
        convertYaGeoObject2Place = function (geoObject) {
          return _.merge(geoObject.properties.placeData, {
            location: {
              longitude: geoObject.geometry.coordinates[0],
              latitude: geoObject.geometry.coordinates[1]
            }
          });
        },
        getYaGeoObjectFromPlace = function (placeData) {
          return {
            properties: {
              type: 'users_place',
              placeData: placeData
            },
            geometry: {
              type: 'Point',
              coordinates: [placeData.location.longitude, placeData.location.latitude]
            },
            options: {
              preset: MARKER_PLACE_PRESET,
              visible: true
            }
          };
        },
        placesGeoObjects = [],
        loadMyPlaces = function () {
          user.getCustomPlaces()
            .then(function (places) {
              placesGeoObjects = _.map(places, getYaGeoObjectFromPlace);
            });
        },
        findPlaceGeoObject = function (placeId) {
          return _.find(placesGeoObjects, {properties: {placeData: {id: placeId}}});
        },
        hideOriginalPlaceMarker = function () {
          var editableGeoObject = findPlaceGeoObject(currentPlaceGeoObject.properties.placeData.id);
          if (editableGeoObject) {
            editableGeoObject.options.visible = false;
          }
        },
        showOriginalPlaceMarker = function () {
          var editableGeoObject = findPlaceGeoObject(currentPlaceGeoObject.properties.placeData.id);
          if (editableGeoObject) {
            editableGeoObject.options.visible = true;
          }
        }
      ;

      // initial load my places
      loadMyPlaces();
      // Save unsaved user's places when client logged in
      $rootScope.$on('auth.signin_success', function () {
        user.saveUnsavedPlaces().then(function () {
          growl.addSuccessMessage('Все места были успешно сохранены');
        });
      });

      return {
        loadMyPlaces: loadMyPlaces,
        getPlacesGeoObjects: function () {
          return placesGeoObjects;
        },
        getSelectedPlaceGeoObject: function () {
          return currentPlaceGeoObject;
        },
        cancelEdit: function () {
          showOriginalPlaceMarker();
          currentPlaceGeoObject = null;
        },
        yaMapClickHandle: function (event) {
          if (!currentPlaceGeoObject) {
            return;
          }

          var coords = event.get('coords');
          // change locations of store marker position
          currentPlaceGeoObject.geometry.coordinates = coords;
          getAddress(coords);
        },
        addBtnYaMapHandle: function (event) {
          var map = event.get('target').getParent().getMap();

          currentPlaceGeoObject = createPlacemark(map.getCenter());
          this.addDeceased();
          getAddress(map.getCenter());
          // reset previous error message
          placeFormError = null;
        },
        selectedGeoObjectDragendHandler: function (event) {
          getAddress(event.get('target').geometry.getCoordinates());
          currentPlaceGeoObject.geometry.coordinates = event.get('target').geometry.getCoordinates();
        },
        editPlaceGeoObject: function (event) {
          currentPlaceGeoObject = getPlacemarkFromYaGeoObject(event.get('target'));
          hideOriginalPlaceMarker();
        },
        addNewPlaceFromSelected: function () {
          var addedGeoObject = _.cloneDeep(currentPlaceGeoObject);
          // reset previous error if exist
          placeFormError = null;

          user.addCustomPlace(convertYaGeoObject2Place(addedGeoObject))
            .then(function () {
              addedGeoObject.options.preset = MARKER_PLACE_PRESET;
              addedGeoObject.options.draggable = false;
              placesGeoObjects.push(addedGeoObject);
              // Reset current place
              currentPlaceGeoObject = null;
              growl.addSuccessMessage('Место было успешно добавлено');
            }, function (errorData) {
              placeFormError = errorData.message;
            });
        },
        savePlaceFromSelected: function () {
          var geoObject = _.cloneDeep(currentPlaceGeoObject);
          // reset previous error if exist
          placeFormError = null;

          user.saveCustomPlace(convertYaGeoObject2Place(geoObject))
            .then(function () {
              // Update placemarker
              var updatedPlacemarkGeoObject = findPlaceGeoObject(geoObject.properties.placeData.id);
              updatedPlacemarkGeoObject.properties.placeData = geoObject.properties.placeData;
              updatedPlacemarkGeoObject.geometry = geoObject.geometry;
              updatedPlacemarkGeoObject.options.preset = MARKER_PLACE_PRESET;
              updatedPlacemarkGeoObject.options.draggable = false;
              updatedPlacemarkGeoObject.options.visible = true;
              // Reset current place
              currentPlaceGeoObject = null;
              growl.addSuccessMessage('Место было успешно сохранено');
            }, function (errorData) {
              placeFormError = errorData.message;
            });
        },
        addDeceased: function () {
          if (!currentPlaceGeoObject.properties.placeData.deadmens) {
            currentPlaceGeoObject.properties.placeData.deadmens = [];
          }

          currentPlaceGeoObject.properties.placeData.deadmens.push({
            firstname: null,
            lastname: null,
            middlename: null,
            birthDate: null,
            deathDate: null
          });
        },
        removeDeceased: function (deadmen) {
          _.remove(currentPlaceGeoObject.properties.placeData.deadmens, deadmen);
        },
        getPlaceFormError: function () {
          return placeFormError;
        },
        isExistsUnsavedPlaces: user.isExistsUnsavedPlaces
      };
    };
  })
;
