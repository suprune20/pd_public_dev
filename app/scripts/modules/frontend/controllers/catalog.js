'use strict';

angular.module('pdFrontend')
  .controller('CatalogCtrl', function ($scope, $modal, $routeParams, $location, Catalog) {
    var openProductDetailsModal = function (productId) {
        $location.search('productId', productId);
        var productData = $scope.catalog.getProduct(productId);

        // Open modal for product details
        $modal.open({
          templateUrl: 'views/modules/frontend/catalog/product.details.modal.html',
          windowClass: 'catalog-product-modal',
          resolve: {
            productData: function () {
              return productData;
            }
          },
          controller: ['$scope', '$modalInstance', 'productData',
            function ($scope, $modalInstance, productData) {
              $scope.productData = productData;
              $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
              };
            }
          ]
        }).result.catch(function () {
            $location.search('productId', null);
          });
      },
      suppliersInTheBounds = [],
      applySuppliersFilterByMap = function (yaMap) {
        // Select only suppliers markers and filter by them
        $scope.filters.supplier = [];
        $scope.visibleSuppliersCategories = [];
        ymaps.geoQuery(yaMap.geoObjects).searchIntersect(yaMap)
          .search('properties.type = "supplier_place"')
          .search('properties.active = true')
          .each(function (geoObject) {
            $scope.filters.supplier.push(geoObject.properties.get('pointData').id);
            $scope.visibleSuppliersCategories.push(geoObject.properties.get('pointData.categories'));
          });
        $scope.visibleSuppliersCategories = _.union.apply(null, $scope.visibleSuppliersCategories);
        suppliersInTheBounds = _.clone($scope.filters.supplier);

        $scope.applyFilters();
      }
    ;

    // Initial set for scope variables
    $scope.filters = {};
    $scope.orders = {};
    $scope.catalog = new Catalog();
    // Get filters data
    $scope.catalog.getCategories().then(function (categories) {
      $scope.categoriesFilter = categories;
      $scope.selectAllCategories = true;
    });

    // Restore product modal details from query params
    if (_.has($routeParams, 'productId')) {
      openProductDetailsModal($routeParams.productId);
    }

    $scope.openProductDetailsModal = openProductDetailsModal;
    $scope.applyFilters = function () {
      $scope.catalog.productsDataProvider.applyFilters($scope.filters, $scope.orders);
    };
    $scope.clearFilters = function () {
      _.forEach($scope.filters, function (value, filterName) {
        $location.search('filter_' + filterName, null);
      });
      $scope.filters = {};
      $scope.catalog.productsDataProvider.applyFilters($scope.filters);
    };

    $scope.mapInitialized = function (map) {
      $scope.$watch('userPlaces', function (userPlaces) {
        if (!userPlaces) {
          return;
        }

        if (userPlaces.length > 1) {
          map.setBounds($scope.catalog.getUsersPlacesBounds(userPlaces));
        }
      });
    };
    // Get yandex map markers data (user's places, suppliers locations, etc.)
    $scope.catalog.getYaMapPoints().then(function (mapPoints) {
      $scope.catalogGeoObjects = mapPoints.allPoints;
      $scope.userPlaces = mapPoints.userPlacesPoints;
      // Set initial map center
      if (1 === $scope.userPlaces.length) {
        var userPlaceLocation = $scope.userPlaces[0].location;
        $scope.mapCenterPoint = [userPlaceLocation.longitude, userPlaceLocation.latitude];
      }
    });
    // Filtered markers by yandex map
    $scope.yaMapBoundsChange = function (event) {
      var eventTarget = event.get('target'),
        yaMap = 'function' === typeof(eventTarget.getMap) ? eventTarget.getMap() : eventTarget;

      applySuppliersFilterByMap(yaMap);
    };
    $scope.markerClick = function (event) {
      var marker = event.get('target');

      if ('supplier_place' === marker.properties.get('type')) {
        $scope.catalog.toggleSupplierYaMarker(marker);
        applySuppliersFilterByMap(marker.getMap());
      }
    };
    // Toggle select/unselect all categories filter
    $scope.$watch('selectAllCategories', function (isSelectAllCategories) {
      $scope.filters.category = isSelectAllCategories ? _.pluck($scope.categoriesFilter, 'id') : [];
    });
    // Update/filters suppliers markers when change categories filter
    $scope.$watchCollection(function () {
      return $scope.filters.category;
    }, function (selectedCategories) {
      $scope.catalogGeoObjects = $scope.catalog.filterSuppliersByCategories($scope.catalogGeoObjects, selectedCategories);
      // Filter by visible suppliers in the bounds
      $scope.filters.supplier = _($scope.catalogGeoObjects)
        .filter(function (geoObject) {
          return _.contains(suppliersInTheBounds, geoObject.properties.pointData.id) &&
            geoObject.options.visible;
        })
        .map(function (geoObject) {
          return geoObject.properties.pointData.id;
        })
        .value()
      ;
      $scope.applyFilters();
    });
    // Toggle order control
    $scope.toggleProductsOrder = function (orderAttr) {
      var toggleValues = [undefined, 'asc', 'desc'];

      $scope.orders[orderAttr] = toggleValues[(toggleValues.indexOf($scope.orders[orderAttr]) % toggleValues.length) + 1];
      $scope.applyFilters();
    };

    // Check custom place
    $scope.catalogViewIsShown = true;
    $scope.$watch('catalogViewIsShown', function (isShown) {
      $scope.catalogGeoObjects.forEach(function (geoObject) {
        geoObject.options.visible = isShown;
      });
    });

    // Unidentified places section
    $scope.unownedPlacesViewIsShown = false;
    $scope.catalog.getUnidentifiedPlacesYaGeoObjects()
      .then(function (placesGeoObjects) {
        $scope.unownedPlacesGeoObjects = placesGeoObjects;
      });
    $scope.$watch('unownedPlacesViewIsShown', function (isShown) {
      _.forEach($scope.unownedPlacesGeoObjects, function (geoObject) {
        geoObject.options.visible = isShown;
      });
    });
  })
;
