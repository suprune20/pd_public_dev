'use strict';

describe('Service: User', function () {
  var $httpBackend,
    serverEndpointUrl,
    userService;

  beforeEach(module('pdApp'));
  beforeEach(inject(function (_$httpBackend_, apiEndpoint, User) {
    $httpBackend = _$httpBackend_;
    serverEndpointUrl = apiEndpoint;
    userService = new User();
  }));
  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should convert location data in user\'s cabinet data', function () {
    var successCallback = jasmine.createSpy('success callback'),
      errorCallback = jasmine.createSpy('error callback');

    $httpBackend.expectGET(serverEndpointUrl + 'cabinet').respond(200, {places: []});
    userService.getProfile().then(successCallback, errorCallback);
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
    userService.getProfile().then(successCallback, errorCallback);
    $httpBackend.flush();

    expect(successCallback).toHaveBeenCalledWith({
      places: [
        {location: {longitude: 31, latitude: 43}},
        {location: null},
        {location: null},
        {location: null}
      ]
    });
    expect(errorCallback).not.toHaveBeenCalled();
  });
});
