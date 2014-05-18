'use strict';

describe('Service: User', function () {
  var $httpBackend,
    serverEndpointUrl,
    $rootScope,
    pdYandexMock,
    userService,
    storageMock,
    authMock;

  beforeEach(function () {
    pdYandexMock = {
      geocode: jasmine.createSpy('pdYandexMock mock for "geocode" method')
    };
    storageMock = {
      set: jasmine.createSpy('storage mock for "set" method'),
      get: jasmine.createSpy('storage mock for "get" method')
    };
    authMock = {
      isAuthenticated: jasmine.createSpy('auth isAuthenticated method mock'),
      isCurrentHasClientRole: jasmine.createSpy('auth isCurrentHasClientRole method mock')
    };
  });
  beforeEach(module('pdFrontend', function($provide) {
    $provide.value('storage', storageMock);
    $provide.value('auth', authMock);
    $provide.value('pdYandex', pdYandexMock);
  }));
  beforeEach(inject(function (_$httpBackend_, pdConfig, _$rootScope_, user) {
    $httpBackend = _$httpBackend_;
    serverEndpointUrl = pdConfig.apiEndpoint;
    $rootScope = _$rootScope_;
    userService = user;
  }));
  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should get places data', function () {
    var successCallback = jasmine.createSpy('success callback'),
      errorCallback = jasmine.createSpy('error callback');

    authMock.isAuthenticated.andReturn(true);
    authMock.isCurrentHasClientRole.andReturn(true);
    $httpBackend.expectGET(serverEndpointUrl + 'profile').respond(200, {places: []});
    userService.getPlaces().then(successCallback, errorCallback);
    $httpBackend.flush();

    expect(successCallback).toHaveBeenCalled();
    expect(errorCallback).not.toHaveBeenCalled();
  });

  it('should not send api request for getting profile data for anonymous user', function () {
    var successCallback = jasmine.createSpy('success callback'),
      errorCallback = jasmine.createSpy('error callback');

    authMock.isAuthenticated.andReturn(false);
    userService.getPlaces().then(successCallback, errorCallback);

    expect(errorCallback).not.toHaveBeenCalled();
  });

  it('should convert location data in user\'s places data', function () {
    var successCallback = jasmine.createSpy('success callback'),
      errorCallback = jasmine.createSpy('error callback');

    authMock.isAuthenticated.andReturn(true);
    authMock.isCurrentHasClientRole.andReturn(true);
    $httpBackend.expectGET(serverEndpointUrl + 'profile').respond(200, {
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

  describe('saveSettings()', function () {
    it('should update phone number if settings has been successfully saved', function () {
      storageMock.get.andReturn({profile: {}});
      $httpBackend.expectPUT(serverEndpointUrl + 'settings').respond(200, {});
      userService.saveSettings({mainPhone: 'mainPhoneNumber'})
        .then(function () {
          expect(storageMock.set).toHaveBeenCalledWith(jasmine.any(String), {profile: {mainPhone: 'mainPhoneNumber'}});
        });
      $httpBackend.flush();
    });
  });
});
