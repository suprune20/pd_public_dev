'use strict';

describe('Service: User', function () {
  var $httpBackend,
    serverEndpointUrl,
    $rootScope,
    pdYandexMock,
    userService;

  beforeEach(function () {
    pdYandexMock = {
      geocode: jasmine.createSpy('pdYandexMock mock for "geocode" method')
    };
  });
  beforeEach(module('pdFrontend', function($provide) {
    $provide.value('pdYandex', pdYandexMock);
  }));
  beforeEach(inject(function (_$httpBackend_, pdConfig, _$rootScope_, User) {
    $httpBackend = _$httpBackend_;
    serverEndpointUrl = pdConfig.apiEndpoint;
    $rootScope = _$rootScope_;
    userService = new User();
  }));
  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should get cabinet data', function () {
    var successCallback = jasmine.createSpy('success callback'),
      errorCallback = jasmine.createSpy('error callback');

    $httpBackend.expectGET(serverEndpointUrl + 'cabinet').respond(200, {places: []});
    userService.getPlaces().then(successCallback, errorCallback);
    $httpBackend.flush();

    expect(successCallback).toHaveBeenCalled();
    expect(errorCallback).not.toHaveBeenCalled();
  });

  it('should convert location data in user\'s cabinet data', function () {
    var successCallback = jasmine.createSpy('success callback'),
      errorCallback = jasmine.createSpy('error callback');

    $httpBackend.expectGET(serverEndpointUrl + 'cabinet').respond(200, {
      places: [
        {location: {longitude: 31, latitude: 43}},
        {location: {longitude: 31, latitude: null}},
        {location: {longitude: null, latitude: 43}},
        {location: null}
      ]
    });
    userService.getPlaces().then(successCallback, errorCallback);
    $httpBackend.flush();

    expect(successCallback).toHaveBeenCalledWith({
      places: [
        {location: {longitude: 31, latitude: 43}, gallery: []},
        {location: null, gallery: []},
        {location: null, gallery: []},
        {location: null, gallery: []}
      ]
    });
    expect(errorCallback).not.toHaveBeenCalled();
  });

  describe('getPlaceCoordinates()', function () {
    it('should return place coordinates from place location data', function () {
      var successCallback = jasmine.createSpy('success callback'),
        errorCallback = jasmine.createSpy('error callback');

      userService.getPlaceCoordinates({location: {latitude: 43, longitude: 12}})
        .then(successCallback, errorCallback);
      $rootScope.$apply();

      expect(successCallback).toHaveBeenCalledWith([12, 43]);
      expect(errorCallback).not.toHaveBeenCalled();
    });

    it('should return place coordinates from yandex geocode service', function () {
      var successCallback = jasmine.createSpy('success callback'),
        errorCallback = jasmine.createSpy('error callback');

      pdYandexMock.geocode.andCallFake(function () {
        return {
          then: jasmine.createSpy().andCallFake(function (cb) {
            cb([53, 12]);
          })
        };
      });

      userService.getPlaceCoordinates({location: null, address: 'any address'})
        .then(successCallback, errorCallback);
      $rootScope.$apply();

      expect(pdYandexMock.geocode).toHaveBeenCalledWith('any address');
      expect(successCallback).toHaveBeenCalledWith([53, 12]);
      expect(errorCallback).not.toHaveBeenCalled();
    });


    it('should return rejected promise if no location and address attributes', function () {
      var successCallback = jasmine.createSpy('success callback'),
        errorCallback = jasmine.createSpy('error callback');

      userService.getPlaceCoordinates({})
        .then(successCallback, errorCallback);
      $rootScope.$apply();

      expect(successCallback).not.toHaveBeenCalled();
      expect(errorCallback).toHaveBeenCalled();
    });
  });
});
