'use strict';

describe('Controller: ClientPanelCtrl', function () {
  var scope,
    userMock;

  // load the controller's module
  beforeEach(module('pdFrontend'));
  beforeEach(function () {
    userMock = function () {
      return {
        getPlaces: jasmine.createSpy('user getPlaces() mock')
          .andCallFake(function () {
            return {
              then: jasmine.createSpy().andCallFake(function (cb) {
                cb({
                  places: [
                    {location: {longitude: 31, latitude: 43}},
                    {location: null}
                  ]
                });
              })
            };
          }),
        getPlaceCoordinates: jasmine.createSpy('user getPlaceCoordinates() mock')
          .andCallFake(function () {
            return {
              then: jasmine.createSpy().andCallFake(function (cb) {
                cb([23, 12]);
              })
            };
          })
      };
    };
  });
  beforeEach(inject(function ($rootScope, $controller) {
    scope = $rootScope.$new();
    $controller('ClientPanelCtrl', {
      $scope: scope,
      User: userMock
    });
  }));

  it('should get user profile data', function () {
    expect(scope.userData).toEqual({
      places: [
        {location: {longitude: 31, latitude: 43}},
        {location: null}
      ]
    });
  });

  it('should select point and set yaPlacePoint object', function () {
    scope.selectPlace({location: {longitude: 31, latitude: 43}});
    expect(scope.selectedPlace).toEqual({location: {longitude: 31, latitude: 43}});
    expect(scope.yaPlacePoint).toEqual({
      geometry: {
        type: 'Point',
        coordinates: [23, 12] // from getPlaceCoordinates mock
      }
    });
  });
});
