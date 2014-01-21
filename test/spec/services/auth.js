'use strict';

describe('Service: Auth', function () {
  var $httpBackend,
    serverEndpointUrl,
    authService,
    storageMock;

  beforeEach(function () {
    storageMock = {
      set: jasmine.createSpy('storage mock for "set" method'),
      remove: jasmine.createSpy('storage mock for "remove" method'),
      get: jasmine.createSpy('storage mock for "get" method')
    };
  });
  beforeEach(module('pdApp', function($provide) {
    $provide.value('storage', storageMock);
  }));
  beforeEach(module('views/main.html'));
  beforeEach(inject(function (_$httpBackend_, pdConfig, auth) {
    $httpBackend = _$httpBackend_;
    serverEndpointUrl = pdConfig.apiEndpoint;
    authService = auth;
  }));
  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  describe('signin method', function () {
    it('should send post request into api and call success callback if has been send right credentials', function () {
      var successCallback = jasmine.createSpy('success callback'),
        errorCallback = jasmine.createSpy('error callback');

      $httpBackend.expectPOST(serverEndpointUrl + 'auth/signin', {
        username: 'username',
        password: 'password'
      }).respond(200, {token: 'qwee123dsczx3rq'});
      authService.signin('username', 'password').then(successCallback, errorCallback);
      $httpBackend.flush();

      expect(successCallback).toHaveBeenCalled();
      expect(errorCallback).not.toHaveBeenCalled();
    });

    it('should save user token into localstorage if success', function () {
      $httpBackend.expectPOST(serverEndpointUrl + 'auth/signin', {
        username: 'username',
        password: 'password'
      }).respond(200, {token: 'qwee123dsczx3rq'});
      authService.signin('username', 'password');
      $httpBackend.flush();

      expect(storageMock.set).toHaveBeenCalled();
      expect(storageMock.set.mostRecentCall.args[1]).toEqual('qwee123dsczx3rq');
    });

    it('should return error message text if bad credentials', function () {
      $httpBackend.expectPOST(serverEndpointUrl + 'auth/signin', {
        username: 'bad',
        password: 'credentials'
      }).respond(400, {status: 'error', message: 'message text'});
      authService.signin('bad', 'credentials').then(angular.noop, function (errorMessage) {
        expect(errorMessage).toEqual('Неверный номер телефона или пароль');
      });
      $httpBackend.flush();
    });
  });

  describe('signout method', function () {
    it('should call remove storage method', function () {
      authService.signout();

      expect(storageMock.remove).toHaveBeenCalled();
    });
  });

  describe('isAuthenticated method', function () {
    it('should return true if token is exists in localstorage', function () {
      storageMock.get.andReturn('token');

      expect(authService.isAuthenticated()).toBeTruthy();
    });

    it('should return false if token is not exists in localstorage', function () {
      storageMock.get.andReturn(undefined);

      expect(authService.isAuthenticated()).toBeFalsy();
    });
  });

  describe('getAuthToken method', function () {
    it('should return auth token for current user', function () {
      storageMock.get.andReturn('token');

      expect(authService.getAuthToken()).toEqual('token');
    });
  });
});
