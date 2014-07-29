'use strict';

angular.module('pdFrontend')
  .controller('CatalogCtrl', function ($scope, $modal, $routeParams, $location, CatalogRefactored, auth) {
    var suppliersInTheBounds = [],
      getSuppliersGeoobjects = function (yaMap) {
        return ymaps
          .geoQuery(yaMap.geoObjects)
          .search('properties.type = "supplier_store_place"')
          .searchIntersect(yaMap)
        ;
      },
      applySuppliersFilterByMap = function (yaMap) {
        // Select only suppliers markers and filter by them
        $scope.filters.supplierStore = [];
        $scope.visibleSuppliersCategories = [];
        // Filter for non editors geo objects
        getSuppliersGeoobjects(yaMap)
          .search('properties.active = true')
          .search('options.visible = true')
          .each(function (geoObject) {
            $scope.filters.supplierStore.push(geoObject.properties.get('pointData').id);
            $scope.visibleSuppliersCategories.push(geoObject.properties.get('pointData.categories'));
          });
        $scope.visibleSuppliersCategories = _.union.apply(null, $scope.visibleSuppliersCategories);

        // calculate suppliers in bounds
        suppliersInTheBounds = [];
        getSuppliersGeoobjects(yaMap)
          .search('properties.active = true')
          .each(function (geoObject) {
            suppliersInTheBounds.push(geoObject.properties.get('pointData').id);
          });

        $scope.applyFilters();
      },
      loadCategories = function () {
        return $scope.catalog.getCategories()
          .then(function (categories) {
            $scope.categoriesFilter = categories;
          });
      }
    ;

    // Initial set for scope variables
    $scope.filters = {};
    $scope.orders = {};
    $scope.flags = {};
    $scope.catalog = new CatalogRefactored();
    // Get filters data
    loadCategories().then(function () {
      $scope.flags.selectAllCategories = true;
    });

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

    // Get yandex map markers data (user's places, suppliers locations, etc.)
    $scope.catalog.getYaMapPoints().then(function (mapPoints) {
      $scope.isLoadedGeoObjects = true;
      $scope.catalogGeoObjects = mapPoints.allPoints;
    });
    // Filtered markers by yandex map
    $scope.yaMapBoundsChange = function (event) {
      var eventTarget = event.get('target'),
        yaMap = 'function' === typeof(eventTarget.getMap) ? eventTarget.getMap() : eventTarget;

      applySuppliersFilterByMap(yaMap);
      // get suppliers geoobjects count
      $scope.allSuppliersInTheBoundsCount = getSuppliersGeoobjects(yaMap).getLength();
    };
    $scope.markerClick = function (event) {
      var marker = event.get('target');

      if ('supplier_store_place' === marker.properties.get('type')) {
        $scope.catalog.toggleSupplierYaMarker(marker);
        applySuppliersFilterByMap(marker.getMap());
      }
    };
    // Toggle select/unselect all categories filter
    $scope.$watch(function () {
      return $scope.flags.selectAllCategories;
    }, function (isSelectAllCategories) {
      $scope.filters.category = isSelectAllCategories ? _.pluck($scope.categoriesFilter, 'id') : [];
    });

    var suppliersFilterDependsCategories = function () {
      $scope.catalogGeoObjects = $scope.catalog
        .filterSuppliersByCategories($scope.catalogGeoObjects, $scope.filters.category);
      // Filter by visible suppliers in the bounds
      $scope.filters.supplierStore = _($scope.catalogGeoObjects)
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
    };
    // Update/filters suppliers markers when change categories filter
    $scope.$watchCollection(function () {
      return $scope.filters.category;
    }, function () {
      suppliersFilterDependsCategories();
    });

    // Client signin modal
    // ToDo: Move to header controller module
    $scope.$on('auth.signin_success', function () {
      loadCategories();
    });
    $scope.clientSignout = function () {
      auth.signout().then(function () {
        loadCategories();
      });
    };
  })
;
