'use strict';

describe('Service: Security', function () {
  var securityService,
    authMock,
    routeMock;

  beforeEach(function () {
    authMock = {
      isAuthenticated: jasmine.createSpy('auth mock for "isAuthenticated" method')
    };
    routeMock = {
      routes: [
        {originalPath: 'secured/url1', secured: true},
        {originalPath: 'secured/url2', secured: true},
        {originalPath: 'unsecured/url'}
      ]
    };
  });
  beforeEach(module('pdApp', function($provide) {
    $provide.value('auth', authMock);
    $provide.value('$route', routeMock);
  }));
  beforeEach(inject(function (security) {
    securityService = security;
  }));

  it('should check secured url by parameter', function () {
    expect(securityService.isSecuredUrl('secured/url1')).toBeTruthy();
    expect(securityService.isSecuredUrl('unsecured/url')).toBeFalsy();
  });

  it('should check is available url for logged user', function () {
    authMock.isAuthenticated.andReturn(true);
    expect(securityService.isAvailableUrl('secured/url1')).toBeTruthy();
    expect(securityService.isAvailableUrl('unsecured/url')).toBeTruthy();
  });

  it('should check is available url for non logged user', function () {
    authMock.isAuthenticated.andReturn(false);
    expect(securityService.isAvailableUrl('secured/url1')).toBeFalsy();
    expect(securityService.isAvailableUrl('unsecured/url')).toBeTruthy();
  });
});

