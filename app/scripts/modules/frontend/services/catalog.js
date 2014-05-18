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
                    visible: true
                  }
                });
              });
              // Add suppliers places points
              _.forEach(suppliersData, function (supplier) {
                if (!supplier.location) {
                  return;
                }

                // ToDo: now removed suppliers without categories
                if (!supplier.categories.length) {
                  return;
                }

                points.push({
                  properties: {
                    type: 'supplier_place',
                    pointData: supplier,
                    active: true
                  },
                  options: {
                    preset: SUPPLIER_YA_MARKER_CHECKED_PRESET,
                    visible: true
                  },
                  geometry: {
                    type: 'Point',
                    coordinates: [supplier.location.longitude, supplier.location.latitude]
                  }
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
            if ('supplier_place' === geoObject.properties.type) {
              geoObject.options.visible = !!_.intersection(categories, geoObject.properties.pointData.categories).length;
            }

            return geoObject;
          });
        }
      };
    };
  })
;
