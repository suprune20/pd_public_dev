'use strict';

describe('Service: OMS placesmap', function () {
  var $httpBackend,
    serverEndpointUrl,
    serverBackendUrl,
    omsPlacesService;

  beforeEach(module('pdOms'));
  beforeEach(inject(function (_$httpBackend_, pdConfig, omsPlaces) {
    $httpBackend = _$httpBackend_;
    serverEndpointUrl = pdConfig.apiEndpoint;
    serverBackendUrl = pdConfig.backendUrl;
    omsPlacesService = omsPlaces;
  }));
  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should return places data with non-empty location', function () {
    var places = [
      {
        areaId: 3,
        cemeteryId: 3,
        id: 1,
        location: null,
        status: []
      }, {
        areaId: 3,
        cemeteryId: 3,
        id: 2,
        location: null,
        status: []
      }, {
        areaId: 3,
        cemeteryId: 3,
        id: 3,
        location: {
          latitude: 43.23,
          longitude: 53.2
        },
        status: []
      }
    ];

    $httpBackend.expectGET(serverEndpointUrl + 'oms/places').respond(200, places);
    omsPlacesService.getPlaces().then(function (placesData) {
      expect(placesData.length).toEqual(1);
      expect(placesData[0].id).toEqual(3);
    });
    $httpBackend.flush();
  });

  it('should return places data from api to yandex geo-objects', function () {
    var placesData = [{
        areaId: 2,
        cemeteryId: 3,
        id: 4,
        location: {
          latitude: 43.23,
          longitude: 53.2
        },
        status: []
      }],
      placeDetailsPageUrl = serverBackendUrl + 'manage/cemetery/3/area/2/place/4';

    expect(omsPlacesService.getYaMapGeoObjectsForPlaces(placesData))
      .toEqual([{
        properties: {
          placeData: placesData[0],
          balloonContentBody: '<a href="' + placeDetailsPageUrl + '" target="_blank">Перейти на карточку места</a>'
        },
        options: {
          preset: 'twirl#greyIcon'
        },
        geometry: {
          type: 'Point',
          coordinates: [53.2, 43.23]
        }
      }]);
  });

  it('should filter yandex geo objects for show/hide on the map by selected statuses filter', function () {
    // Mock tiny yandex geo objects array
    var yaGeoObjects = [{
      properties: {
        placeData: {
          status: []
        }
      },
      options: {}
    }, {
      properties: {
        placeData: {
          status: ['dt_military']
        }
      },
      options: {}
    }];

    expect(omsPlacesService.filterPlacesGeoObjects(yaGeoObjects, {'dt_military': true, 'dt_size_violated': true}))
      .toEqual([{
        properties: {
          placeData: {
            status: []
          }
        },
        options: {
          visible: false
        }
      }, {
        properties: {
          placeData: {
            status: ['dt_military']
          }
        },
        options: {
          visible: true
        }
      }]);
    expect(omsPlacesService.filterPlacesGeoObjects(yaGeoObjects, {'dt_military': false, 'dt_size_violated': false}))
      .toEqual([{
        properties: {
          placeData: {
            status: []
          }
        },
        options: {
          visible: true
        }
      }, {
        properties: {
          placeData: {
            status: ['dt_military']
          }
        },
        options: {
          visible: false
        }
      }]);
  });
});
