'use strict';

describe('Controller: CatalogCtrl', function () {
  var scope,
    $locationMock,
    $routeParamsMock,
    $modalMock,
    catalogMock;

  // load the controller's module
  beforeEach(module('pdFrontend'));
  beforeEach(function () {
    $locationMock = {
      search: jasmine.createSpy('$location search mock')
    };
    $modalMock = {
      open: jasmine.createSpy('$modal open mock').andReturn({
        result: {
          catch: jasmine.createSpy()
        }
      })
    };
    $routeParamsMock = {};
    catalogMock = function () {
      return {
        productsDataProvider: {
          applyFilters: jasmine.createSpy()
        },
        getCategories: jasmine.createSpy('catalog getCategories() mock')
          .andCallFake(function () {
            return {
              then: jasmine.createSpy().andCallFake(function (cb) {
                cb([ { id : 1, title : 'category 1' } ]);

                return {
                  then: jasmine.createSpy()
                };
              })
            };
          }),
        getFilters: jasmine.createSpy('catalog getFilters() mock')
          .andCallFake(function () {
            return {
              then: jasmine.createSpy().andCallFake(function (cb) {
                cb({
                  supplier: [
                    {
                      id: 1,
                      name: 'supplier 1'
                    }
                  ],
                  place: [
                    {
                      id: 1,
                      name: 'place 1'
                    }
                  ]
                });
              })
            };
          }),
        getProduct: jasmine.createSpy(),
        getYaMapPoints: jasmine.createSpy()
          .andCallFake(function () {
            return {
              then: jasmine.createSpy()
            };
          }),
        getUnidentifiedPlacesYaGeoObjects: jasmine.createSpy().andCallFake(function () {
          return {
            then: jasmine.createSpy()
          };
        })
      };
    };
  });

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  describe('filters', function () {
    beforeEach(inject(function ($controller) {
      $controller('CatalogCtrl', {
        $scope: scope,
        $location: $locationMock,
        $routeParams: $routeParamsMock,
        $modal: $modalMock,
        CatalogRefactored: catalogMock
      });
    }));

    it('should getting categories filter data', function () {
      expect(scope.catalog.getCategories).toHaveBeenCalled();
      expect(scope.categoriesFilter).toEqual([{id: 1, title: 'category 1'}]);
    });

    it('should apply filters data', function () {
      scope.filters = {catalog: 123, supplier: [1, 2]};
      scope.applyFilters();

      expect(scope.catalog.productsDataProvider.applyFilters).toHaveBeenCalledWith(scope.filters, {});
    });

    it('should clear filters data', function () {
      scope.filters = {catalog: 123, supplier: [1, 2]};
      scope.clearFilters();

      expect(scope.filters).toEqual({});
      expect(scope.catalog.productsDataProvider.applyFilters).toHaveBeenCalledWith({});
    });
  });

  describe('modal', function () {
    beforeEach(inject(function ($controller) {
      scope.seo =  {
        getTitle: jasmine.createSpy()
      };
      $controller('CatalogCtrl', {
        $scope: scope,
        $location: $locationMock,
        $routeParams: {productId: 123},
        $modal: $modalMock,
        CatalogRefactored: catalogMock
      });
    }));

    it('should restore modal product details window', function () {
      expect($modalMock.open).toHaveBeenCalled();
      expect($locationMock.search).toHaveBeenCalledWith('productId', 123);
//      expect(scope.catalog.getProduct).toHaveBeenCalledWith(123);
    });
  });
});
