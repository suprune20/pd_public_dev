'use strict';

describe('Service: Loru advertisement', function () {
  var $httpBackend,
    serverEndpointUrl,
    advertisementService;

  beforeEach(module('pdLoru'));
  beforeEach(inject(function (_$httpBackend_, apiEndpoint, advertisement) {
    $httpBackend = _$httpBackend_;
    serverEndpointUrl = apiEndpoint;
    advertisementService = advertisement;
  }));
  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should return products by places data', function () {
    var errorCallback = jasmine.createSpy('error callback'),
      products = [
        {
          'availableOnPlaces': [],
          'id': 1,
          'name': 'Product1'
        }, {
          'availableOnPlaces': [64],
          'id': 2,
          'name': 'Product2'
        }
      ],
      places = [{
        'id': 64,
        'name': 'Place1',
        'cost': '0.00',
        'currency': 'USD'
      }];

    $httpBackend.expectGET(serverEndpointUrl + 'loru/products').respond(200, products);
    $httpBackend.expectGET(serverEndpointUrl + 'loru/places').respond(200, {results: places});
    advertisementService.getProductsByPlaces().then(function (productsData) {
      expect(productsData.products).toEqual(products);
      expect(productsData.places).toEqual(places);
      expect(productsData.productsByPlaces).toEqual({
        1: {64: 'disable'},
        2: {64: 'enable'}
      });
    }, errorCallback);
    $httpBackend.flush();

    expect(errorCallback).not.toHaveBeenCalled();
  });

  it('should convert products-places data for save into api', function () {
    $httpBackend.expectPOST(serverEndpointUrl + 'loru/product_places', [
      {
        id: 1,
        places: [
          {id: 2, status: 'disable'},
          {id: 3, status: 'up'}
        ]
      },
      {
        id: 2,
        places: [
          {id: 2, status: 'enable'}
        ]
      }
    ]).respond(200);
    advertisementService.saveProductsChanges([
      {productId: 1, placeId: 2, status: 'disable'},
      {productId: 1, placeId: 3, status: 'up'},
      {productId: 2, placeId: 2, status: 'enable'}
    ]);
    $httpBackend.flush();
  });
});
