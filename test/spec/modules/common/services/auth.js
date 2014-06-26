'use strict';

describe('Service: Auth', function () {
  var $httpBackend,
    serverEndpointUrl,
    authService,
    storageMock,
    ipCookieMock,
    pdConfig;

  beforeEach(function () {
    storageMock = {
      set: jasmine.createSpy('storage mock for "set" method'),
      remove: jasmine.createSpy('storage mock for "remove" method'),
      get: jasmine.createSpy('storage mock for "get" method')
    };
    ipCookieMock = jasmine.createSpy('ipCookie service mock');
  });
  beforeEach(module('pdCommon', function($provide) {
    $provide.value('storage', storageMock);
    $provide.value('ipCookie', ipCookieMock);
  }));
  beforeEach(inject(function (_$httpBackend_, _pdConfig_, auth) {
    $httpBackend = _$httpBackend_;
    serverEndpointUrl = _pdConfig_.apiEndpoint;
    authService = auth;
    pdConfig = _pdConfig_;
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

      expect(storageMock.set).toHaveBeenCalledWith(pdConfig.AUTH_TOKEN_KEY, 'qwee123dsczx3rq');
    });

    it('should save user sessionId into cookies if success', function () {
      $httpBackend.expectPOST(serverEndpointUrl + 'auth/signin', {
        username: 'username',
        password: 'password'
      }).respond(200, {token: 'qwee123dsczx3rq', sessionId: 'session id value'});
      authService.signin('username', 'password');
      $httpBackend.flush();

      expect(ipCookieMock).toHaveBeenCalledWith('pdsession', 'session id value', jasmine.any(Object));
    });

    it('should return error message text if bad credentials', function () {
      $httpBackend.expectPOST(serverEndpointUrl + 'auth/signin', {
        username: 'bad',
        password: 'credentials'
      }).respond(400, {status: 'error', message: 'message text'});
      authService.signin('bad', 'credentials').then(angular.noop, function (errorData) {
        expect(errorData).toEqual({
          status: 'error',
          message: 'message text',
          errorCode: 'wrong_credentials'
        });
      });
      $httpBackend.flush();
    });

    it('should convert roles into array if getting string', function () {
      $httpBackend.expectPOST(serverEndpointUrl + 'auth/signin', {
        username: 'username',
        password: 'password'
      }).respond(200, {token: 'token_ololo', role: 'role'});
      authService.signin('username', 'password').then(function (respData) {
        expect(respData).toEqual({
          token: 'token_ololo',
          role: ['role']
        });
      });
      $httpBackend.flush();
    });

    it('should save user roles into localstorage if success', function () {
      $httpBackend.expectPOST(serverEndpointUrl + 'auth/signin', {
        username: 'username',
        password: 'password'
      }).respond(200, {token: 'qwee123dsczx3rq', role: ['ROLE_CLIENT']});
      authService.signin('username', 'password');
      $httpBackend.flush();

      expect(storageMock.set).toHaveBeenCalledWith(pdConfig.AUTH_ROLES_KEY, ['ROLE_CLIENT']);
    });
  });

  describe('get password by SMS method', function () {
    it('should send post request into api and call success callback if has been send right data', function () {
      var successCallback = jasmine.createSpy('success callback'),
        errorCallback = jasmine.createSpy('error callback');

      $httpBackend.expectPOST(serverEndpointUrl + 'auth/get_password_by_sms', {
        phoneNumber: 'username',
        recaptchaData: {
          response: 'response',
          challenge: 'challenge'
        }
      }).respond(200, {message: 'success'});
      authService.getPasswordBySMS('username', {response: 'response',challenge: 'challenge'})
        .then(successCallback, errorCallback);
      $httpBackend.flush();

      expect(successCallback).toHaveBeenCalled();
      expect(errorCallback).not.toHaveBeenCalled();
    });

    it('should return error message text if bad credentials', function () {
      var successCallback = jasmine.createSpy('success callback'),
        errorCallback = jasmine.createSpy('error callback');

      $httpBackend.expectPOST(serverEndpointUrl + 'auth/get_password_by_sms', {
        phoneNumber: 'bad',
        recaptchaData: {response: 'response',challenge: 'challenge'}
      }).respond(400, {status: 'error', message: 'message text'});
      authService.getPasswordBySMS('bad', {response: 'response',challenge: 'challenge'})
        .then(successCallback, errorCallback);
      $httpBackend.flush();

      expect(successCallback).not.toHaveBeenCalled();
      expect(errorCallback).toHaveBeenCalled();
    });
  });

  describe('signout method', function () {
    it('should call remove storage method', function () {
      $httpBackend.expectPOST(serverEndpointUrl + 'auth/signout').respond(200, {});
      authService.signout();
      $httpBackend.flush();

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

  describe('getRoles method', function () {
    it('should return roles for current user from localstorage', function () {
      storageMock.get.andReturn(['ROLE_CLIENT']);

      expect(authService.getRoles()).toEqual(['ROLE_CLIENT']);
    });
  });

  describe('getUserProfile method', function () {
    it('should return profile data for current user from localstorage', function () {
      storageMock.get.andReturn({'profile':{'username':'loru1','firstname':'Иван','middlename':'Иванович','photo':null,'mainPhone':null,'lastname':'Петров','email':'qq@mail.ru'},'organisation':{'location':{'coords':{'latitude':53.915809,'longitude':27.504815},'address':'улица Ленина, дом 53А, Калуга, Калужская область, Россия 248016'},'id':19,'name':'Рит_комп19'}});

      expect(authService.getUserProfile()).toEqual({'username':'loru1','firstname':'Иван','middlename':'Иванович','photo':null,'mainPhone':null,'lastname':'Петров','email':'qq@mail.ru'});
    });
  });

  describe('getUserOrganisation method', function () {
    it('should return organisation data for current user from localstorage', function () {
      storageMock.get.andReturn({'profile':{'username':'loru1','firstname':'Иван','middlename':'Иванович','photo':null,'mainPhone':null,'lastname':'Петров','email':'qq@mail.ru'},'organisation':{'location':{'coords':{'latitude':53.915809,'longitude':27.504815},'address':'улица Ленина, дом 53А, Калуга, Калужская область, Россия 248016'},'id':19,'name':'Рит_комп19'}});

      expect(authService.getUserOrganisation()).toEqual({'location':{'coords':{'latitude':53.915809,'longitude':27.504815},'address':'улица Ленина, дом 53А, Калуга, Калужская область, Россия 248016'},'id':19,'name':'Рит_комп19'});
    });
  });

  describe('get role methods', function () {
    it('should false if current logged user has not client role', function () {
      storageMock.get.andReturn(null);

      expect(authService.isCurrentHasClientRole()).toBeFalsy();
    });

    it('should true if current logged user has client role', function () {
      storageMock.get.andReturn(['ROLE_CLIENT']);

      expect(authService.isCurrentHasClientRole()).toBeTruthy();
    });

    it('should true if current logged user has loru role', function () {
      storageMock.get.andReturn(['ROLE_CLIENT', 'ROLE_LORU']);

      expect(authService.isCurrentHasLoruRole()).toBeTruthy();
    });

    it('should true if current logged user has client role', function () {
      storageMock.get.andReturn(['ROLE_OMS']);

      expect(authService.isCurrentHasOmsRole()).toBeTruthy();
    });
  });
});
