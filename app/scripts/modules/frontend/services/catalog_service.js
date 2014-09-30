'use strict';

angular.module('pdFrontend')
  .factory('CatalogRefactored', function ($q, user, pdYandex, pdFrontendCatalogApi, auth) {
    return function (productsCountPerRequest) {
      var SUPPLIER_YA_MARKER_CHECKED_PRESET = 'twirl#greyDotIcon',
        SUPPLIER_YA_MARKER_UNCHECKED_PRESET = 'twirl#greyIcon';
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
            offset: products.length,
            'order[date]': 'asc'
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
        getSupplier: function (supplierId) {
          return pdFrontendCatalogApi.getSupplier(supplierId)
            .then(function (supplierData) {
              supplierData.isOwner = supplierData.id === auth.getUserOrganisation().id;
              return supplierData;
            });
        },
        productsDataProvider: productsDataProvider,
        getYaMapPoints: function getYaMapPointsData(suppliersCategories) {
          return $q.all([pdFrontendCatalogApi.getSuppliers(suppliersCategories)])
            .then(function (promiseData) {
              var points = [],
                suppliersData = promiseData[0];

              // Add suppliers places points
              _.forEach(suppliersData, function (supplier) {
                if (!supplier.categories.length || !supplier.stores.length) {
                  return;
                }

                supplier.stores.forEach(function (storeData) {
                  if (!storeData.location) {
                    return;
                  }

                  storeData.categories = supplier.categories;
                  points.push({
                    properties: {
                      type: 'supplier_store_place',
                      pointData: storeData,
                      active: false
                    },
                    options: {
                      preset: SUPPLIER_YA_MARKER_UNCHECKED_PRESET,
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
  // ToDo: break compatibility for map page
  .factory('Catalog', function ($q, user, pdYandex, pdFrontendCatalogApi) {
    return function (productsCountPerRequest) {
      var SUPPLIER_YA_MARKER_CHECKED_PRESET = 'twirl#greyDotIcon',
        SUPPLIER_YA_MARKER_UNCHECKED_PRESET = 'twirl#greyIcon';
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
          return $q.all([pdFrontendCatalogApi.getSuppliers(suppliersCategories)])
            .then(function (promiseData) {
              var points = [],
                suppliersData = promiseData[0];

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
;
