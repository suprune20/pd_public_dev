'use strict';

describe('Controller: CatalogCtrl', function () {
  var scope,
    userMock;

  // load the controller's module
  beforeEach(module('pdApp'));
  beforeEach(function () {
    userMock = function () {
      return {
        getProfile: jasmine.createSpy('user getProfile() mock')
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

  it('should get places points for yandex map from user profile data', function () {
    expect(scope.yaPlacesPoints).toEqual([
      {
        geometry: {
          type: 'Point',
          coordinates: [31, 43]
        }
      }
    ]);
  });

  it('should select point and calculate center point for yandex map', function () {
    scope.selectPlace({location: {longitude: 31, latitude: 43}});
    expect(scope.selectedPlace).toEqual({location: {longitude: 31, latitude: 43}});
    expect(scope.placesMapCenter).toEqual([31, 43]);
  });

  it('should not set center point for yandex map if no location data', function () {
    scope.selectPlace({location: null});
    expect(scope.placesMapCenter).toBeNull();
  });
});
