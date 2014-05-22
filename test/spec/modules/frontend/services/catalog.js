'use strict';

describe('Service: Catalog', function () {
  var $httpBackend,
    serverEndpointUrl,
    catalogService,
    userServiceMock;

  beforeEach(function () {
    userServiceMock = {
      getPlaces: jasmine.createSpy('user service getPlaces mock')
    };
  });
  beforeEach(module('pdFrontend', function($provide) {
    $provide.value('user', userServiceMock);
  }));
  beforeEach(inject(function (_$httpBackend_, pdConfig, Catalog) {
    $httpBackend = _$httpBackend_;
    serverEndpointUrl = pdConfig.apiEndpoint;
    catalogService = new Catalog();
  }));
  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should getting common filters data', function () {
    var successCallback = jasmine.createSpy('success callback'),
      errorCallback = jasmine.createSpy('error callback');

    $httpBackend.expectGET(serverEndpointUrl + 'catalog_filters').respond(200, []);
    catalogService.getFilters().then(successCallback, errorCallback);
    $httpBackend.flush();

    expect(successCallback).toHaveBeenCalled();
    expect(errorCallback).not.toHaveBeenCalled();
  });

  it('should get and convert categories filters data', function () {
    var successCallback = jasmine.createSpy('success callback'),
      errorCallback = jasmine.createSpy('error callback');

    $httpBackend.expectGET(serverEndpointUrl + 'catalog/categories').respond(200, {
      results: [
        {id: 1, name: 'category 1'}
      ]
    });
    catalogService.getCategories().then(successCallback, errorCallback);
    $httpBackend.flush();

    expect(successCallback).toHaveBeenCalledWith([{id: 1, name: 'category 1'}]);
    expect(errorCallback).not.toHaveBeenCalled();
  });

  it('should get and convert product details data', function () {
    var successCallback = jasmine.createSpy('success callback'),
      errorCallback = jasmine.createSpy('error callback');

    $httpBackend.expectGET(serverEndpointUrl + 'catalog/products/123').respond(200, {
      results: [
        {id: 123, name: 'product 123'}
      ]
    });
    catalogService.getProduct(123).then(successCallback, errorCallback);
    $httpBackend.flush();

    expect(successCallback).toHaveBeenCalledWith({id: 123, name: 'product 123'});
    expect(errorCallback).not.toHaveBeenCalled();
  });

  describe('products data provide', function () {
    it('should get products data with default pagination values', function () {
      $httpBackend.expectGET(serverEndpointUrl + 'catalog/products?limit=15&offset=0').respond(200, {results: []});
      catalogService.productsDataProvider.getNextProducts();
      $httpBackend.flush();
    });

    it('should get products data with custom pagination values', inject(function (Catalog) {
      catalogService = new Catalog(1);

      $httpBackend.expectGET(serverEndpointUrl + 'catalog/products?limit=1&offset=0').respond(200, {results: [
        {id: 1, name: 'product title'}
      ]});
      catalogService.productsDataProvider.getNextProducts();
      $httpBackend.flush();

      $httpBackend.expectGET(serverEndpointUrl + 'catalog/products?limit=1&offset=1').respond(200, {results: []});
      catalogService.productsDataProvider.getNextProducts();
      $httpBackend.flush();
    }));

    it('should get products data', function () {
      $httpBackend.expectGET(serverEndpointUrl + 'catalog/products?limit=15&offset=0').respond(200, {results: [
        {id: 1, name: 'product title'}
      ]});
      catalogService.productsDataProvider.getNextProducts();
      $httpBackend.flush();

      expect(catalogService.productsDataProvider.getProducts()).toEqual([{id: 1, name: 'product title'}]);
    });

    it('should set isNoMoreProducts flag', function () {
      $httpBackend.expectGET(serverEndpointUrl + 'catalog/products?limit=15&offset=0').respond(200, {results: []});
      catalogService.productsDataProvider.getNextProducts();
      $httpBackend.flush();

      expect(catalogService.productsDataProvider.isNoMoreProducts()).toBeTruthy();
    });

    it('should not set isNoMoreProducts', inject(function (Catalog) {
      catalogService = new Catalog(1);

      $httpBackend.expectGET(serverEndpointUrl + 'catalog/products?limit=1&offset=0').respond(200, {results: [
        {id: 1, name: 'product title'}
      ]});
      catalogService.productsDataProvider.getNextProducts();
      $httpBackend.flush();

      expect(catalogService.productsDataProvider.isNoMoreProducts()).toBeFalsy();
    }));

    it('should set isBusy flag to true', function () {
      $httpBackend.expectGET(serverEndpointUrl + 'catalog/products?limit=15&offset=0').respond(200, {results: []});
      catalogService.productsDataProvider.getNextProducts();

      expect(catalogService.productsDataProvider.isBusy()).toBeTruthy();
      $httpBackend.flush();
      expect(catalogService.productsDataProvider.isBusy()).toBeFalsy();
    });

    it('should apply filters for getting products data', function () {
      catalogService.productsDataProvider.applyFilters({
        category: 123,
        supplier: [1, 2]
      });
      $httpBackend
        .expectGET(serverEndpointUrl + 'catalog/products?filter%5Bcategory%5D=123' +
          '&filter%5Bsupplier%5D=1&filter%5Bsupplier%5D=2' +
          '&limit=15&offset=0')
        .respond(200, {results: []});
      catalogService.productsDataProvider.getNextProducts();
      $httpBackend.flush();
    });
  });

  describe('getYaMapPoints method', function () {
    it('should send requests for getting user\'s places and suppliers', function () {
      userServiceMock.getPlaces.andReturn([{}]);
      $httpBackend.expectGET(serverEndpointUrl + 'catalog/suppliers').respond(200, {});
      catalogService.getYaMapPoints();
      $httpBackend.flush();

      expect(userServiceMock.getPlaces).toHaveBeenCalled();
    });

    it('should return user\'s places converted for yandex map geoobjects and ignore places without location', function () {
      var userPlacesData = {
        places: [{
          location: {
            latitude: 43,
            longitude: 54
          },
          stores: [{location: {
            latitude: 43,
            longitude: 54
          }}]
        }, {
          location: null,
          stores: []
        }]
      };

      userServiceMock.getPlaces.andReturn(userPlacesData);
      $httpBackend.expectGET(serverEndpointUrl + 'catalog/suppliers').respond(200, {});
      catalogService.getYaMapPoints().then(function (mapPoints) {
        expect(mapPoints).toEqual({
          allPoints: [{
            properties: {
              type: 'users_place',
              pointData: userPlacesData.places[0]
            },
            geometry: {
              type: 'Point',
              coordinates: [userPlacesData.places[0].location.longitude, userPlacesData.places[0].location.latitude]
            },
            options: {
              visible: true,
              preset: 'twirl#greyIcon'
            }
          }],
          userPlacesPoints: userPlacesData.places,
          suppliersPoints: undefined
        });
      });
      $httpBackend.flush();
    });

    it('should return suppliers\'s places converted for yandex map geoobjects and ignore places without location and without categories', function () {
      var suppliersData = {
        supplier: [{
          location: {
            latitude: 43,
            longitude: 54
          },
          categories: ['test'],
          stores: [{
            id: 1,
            location: {
              latitude: 43,
              longitude: 54
            }
          }]
        }, {
          location: {
            latitude: 43,
            longitude: 54
          },
          categories: [],
          stores: []
        }, {
          location: null,
          categories: ['test'],
          stores: [{
            location: {
              latitude: 43,
              longitude: 54
            }
          }]
        }]
      };

      userServiceMock.getPlaces.andReturn({});
      $httpBackend.expectGET(serverEndpointUrl + 'catalog/suppliers').respond(200, suppliersData);
      catalogService.getYaMapPoints().then(function (mapPoints) {
        expect(mapPoints.allPoints.length).toBe(1);
        expect(mapPoints.allPoints[0].properties.pointData.id).toBe(1);
        expect(mapPoints.allPoints[0].properties.pointData.categories).toEqual(suppliersData.supplier[0].categories);
        expect(mapPoints.userPlacesPoints.length).toBe(0);
        expect(mapPoints.suppliersPoints.length).toBe(3);
      });
      $httpBackend.flush();
    });
  });

  it('should filter suppliers by selected categories', function () {
    var geoObjects = [{
      properties: {
        type: 'supplier_store_place',
        pointData: {
          categories: ['category1', 'category2']
        },
        active: true
      },
      options: {
        preset: 'twirl#darkgreenDotIcon',
        visible: true
      },
      geometry: {
        type: 'Point',
        coordinates: [3, 3]
      }
    }, {
      properties: {
        type: 'supplier_store_place',
        pointData: {
          categories: ['category2']
        },
        active: true
      },
      options: {
        preset: 'twirl#darkgreenDotIcon',
        visible: true
      },
      geometry: {
        type: 'Point',
        coordinates: [3, 3]
      }
    }, {
      properties: {
        type: 'supplier_store_place',
        pointData: {
          categories: ['category3']
        },
        active: true
      },
      options: {
        preset: 'twirl#darkgreenDotIcon',
        visible: true
      },
      geometry: {
        type: 'Point',
        coordinates: [3, 3]
      }
    }];

    expect(catalogService.filterSuppliersByCategories(geoObjects, ['category2']))
      .toEqual([{
        properties: {
          type: 'supplier_store_place',
          pointData: {
            categories: ['category1', 'category2']
          },
          active: true
        },
        options: {
          preset: 'twirl#darkgreenDotIcon',
          visible: true
        },
        geometry: {
          type: 'Point',
          coordinates: [3, 3]
        }
      }, {
        properties: {
          type: 'supplier_store_place',
          pointData: {
            categories: ['category2']
          },
          active: true
        },
        options: {
          preset: 'twirl#darkgreenDotIcon',
          visible: true
        },
        geometry: {
          type: 'Point',
          coordinates: [3, 3]
        }
      }, {
        properties: {
          type: 'supplier_store_place',
          pointData: {
            categories: ['category3']
          },
          active: true
        },
        options: {
          preset: 'twirl#darkgreenDotIcon',
          visible: false
        },
        geometry: {
          type: 'Point',
          coordinates: [3, 3]
        }
      }]);
  });
});
