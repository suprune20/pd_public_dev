'use strict';

describe('Service: Catalog', function () {
  var $httpBackend,
    serverEndpointUrl,
    catalogService;

  beforeEach(module('pdApp'));
  beforeEach(inject(function (_$httpBackend_, apiEndpoint, Catalog) {
    $httpBackend = _$httpBackend_;
    serverEndpointUrl = apiEndpoint;
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

    $httpBackend.expectGET(serverEndpointUrl + 'product_category').respond(200, {
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

    $httpBackend.expectGET(serverEndpointUrl + 'product?id=123').respond(200, {
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
      $httpBackend.expectGET(serverEndpointUrl + 'products?limit=15&offset=0').respond(200, {results: []});
      catalogService.productsDataProvider.getNextProducts();
      $httpBackend.flush();
    });

    it('should get products data with custom pagination values', inject(function (Catalog) {
      catalogService = new Catalog(1);

      $httpBackend.expectGET(serverEndpointUrl + 'products?limit=1&offset=0').respond(200, {results: [
        {id: 1, name: 'product title'}
      ]});
      catalogService.productsDataProvider.getNextProducts();
      $httpBackend.flush();

      $httpBackend.expectGET(serverEndpointUrl + 'products?limit=1&offset=1').respond(200, {results: []});
      catalogService.productsDataProvider.getNextProducts();
      $httpBackend.flush();
    }));

    it('should get products data', function () {
      $httpBackend.expectGET(serverEndpointUrl + 'products?limit=15&offset=0').respond(200, {results: [
        {id: 1, name: 'product title'}
      ]});
      catalogService.productsDataProvider.getNextProducts();
      $httpBackend.flush();

      expect(catalogService.productsDataProvider.getProducts()).toEqual([{id: 1, name: 'product title'}]);
    });

    it('should set isNoMoreProducts flag', function () {
      $httpBackend.expectGET(serverEndpointUrl + 'products?limit=15&offset=0').respond(200, {results: []});
      catalogService.productsDataProvider.getNextProducts();
      $httpBackend.flush();

      expect(catalogService.productsDataProvider.isNoMoreProducts()).toBeTruthy();
    });

    it('should not set isNoMoreProducts', inject(function (Catalog) {
      catalogService = new Catalog(1);

      $httpBackend.expectGET(serverEndpointUrl + 'products?limit=1&offset=0').respond(200, {results: [
        {id: 1, name: 'product title'}
      ]});
      catalogService.productsDataProvider.getNextProducts();
      $httpBackend.flush();

      expect(catalogService.productsDataProvider.isNoMoreProducts()).toBeFalsy();
    }));

    it('should set isBusy flag to true', function () {
      $httpBackend.expectGET(serverEndpointUrl + 'products?limit=15&offset=0').respond(200, {results: []});
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
        .expectGET(serverEndpointUrl + 'products?filter%5Bcategory%5D=123' +
          '&filter%5Bsupplier%5D=1&filter%5Bsupplier%5D=2' +
          '&limit=15&offset=0')
        .respond(200, {results: []});
      catalogService.productsDataProvider.getNextProducts();
      $httpBackend.flush();
    });
  });
});
