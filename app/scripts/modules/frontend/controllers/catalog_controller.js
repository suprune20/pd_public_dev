'use strict';

angular.module('pdFrontend')
  .controller('CatalogCtrl', function ($scope, $modal, $routeParams, $location, CatalogRefactored, auth, growl) {
    var openProductDetailsModal = function (productId) {
        $location.search('productId', productId);
        // set page title (SEO) for restore after close
        var savedTitle = $scope.seo.getTitle();

        // Open modal for product details
        $modal.open({
          templateUrl: 'views/modules/frontend/catalog/product.details.modal.html',
          windowClass: 'catalog-product-modal',
          resolve: {
            productData: function () {
              return $scope.catalog.getProduct(productId);
            }
          },
          controller: ['$scope', 'productData',
            function ($scope, productData) {
              // set product name into page title
              $scope.seo.setTitle(productData.name);
              $scope.productData = productData;
            }
          ]
        }).result.catch(function () {
            $location.search('productId', null);
            // restore page title
            $scope.seo.setTitle(savedTitle);
          });
      },
      suppliersInTheBounds = [],
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
          .each(function (geoObject) {
            $scope.filters.supplierStore.push(geoObject.properties.get('pointData').id);
            $scope.visibleSuppliersCategories.push(geoObject.properties.get('pointData.categories'));
          });
        $scope.visibleSuppliersCategories = _.union.apply(null, $scope.visibleSuppliersCategories);
        suppliersInTheBounds = _.clone($scope.filters.supplierStore);

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

    // Get yandex map markers data (user's places, suppliers locations, etc.)
    $scope.catalog.getYaMapPoints().then(function (mapPoints) {
      $scope.isLoadedGeoObjects = true;
      $scope.catalogGeoObjects = mapPoints.allPoints;

      // set visibility for catalog geoObjects by default
      $scope.catalogGeoObjects.forEach(function (geoObject) {
        geoObject.options.visible = $scope.catalogViewIsShown;
      });
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
