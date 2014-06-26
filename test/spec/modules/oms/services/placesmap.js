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
          iconImageHref: 'images/blueCircleDotIcon.png',
          iconImageSize: [5, 5],
          iconImageOffset: [-2.5, -2.5],
          iconContentOffset: [-2.5, -2.5],
          iconContentSize: [10, 10]
        },
        geometry: {
          type: 'Point',
          coordinates: [53.2, 43.23]
        }
      }]);
  });

  it('should return different markers for places with different statuses', function () {
    var placesData = [{
        areaId: 2,
        cemeteryId: 3,
        id: 4,
        location: {
          latitude: 43.23,
          longitude: 53.2
        },
        status: []
      }, {
        areaId: 2,
        cemeteryId: 3,
        id: 4,
        location: {
          latitude: 43.23,
          longitude: 53.2
        },
        status: ['dt_military']
      }, {
        areaId: 2,
        cemeteryId: 3,
        id: 4,
        location: {
          latitude: 43.23,
          longitude: 53.2
        },
        status: ['dt_unowned']
      }, {
        areaId: 2,
        cemeteryId: 3,
        id: 4,
        location: {
          latitude: 43.23,
          longitude: 53.2
        },
        status: ['dt_unindentified', 'dt_military']
      }];

    expect(omsPlacesService.getYaMapGeoObjectsForPlaces(placesData)[0].options.iconImageHref)
      .toEqual('images/blueCircleDotIcon.png');
    expect(omsPlacesService.getYaMapGeoObjectsForPlaces(placesData)[1].options.iconImageHref)
      .toEqual('images/blueCircleDotIcon.png');
    expect(omsPlacesService.getYaMapGeoObjectsForPlaces(placesData)[2].options.iconImageHref)
      .toEqual('images/redCircleDotIcon.png');
    expect(omsPlacesService.getYaMapGeoObjectsForPlaces(placesData)[3].options.iconImageHref)
      .toEqual('images/redCircleDotIcon.png');
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

    // Show active and filter by selected statuses filter
    expect(omsPlacesService.filterPlacesGeoObjects(yaGeoObjects, {
      statusFilter: {
        'dt_military': true,
        'dt_size_violated': true
      },
      showActive: true
    }))
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
    // Show active and no one statuses is selected by filter
    expect(omsPlacesService.filterPlacesGeoObjects(yaGeoObjects, {
      statusFilter: {
        'dt_military': false,
        'dt_size_violated': false
      },
      showActive: true
    }))
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
    // Show inactive and no one statuses is selected by filter
    expect(omsPlacesService.filterPlacesGeoObjects(yaGeoObjects, {
      statusFilter: {
        'dt_military': false,
        'dt_size_violated': false
      },
      showActive: false
    }))
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
    // Show inactive and any statuses is selected by filter
    expect(omsPlacesService.filterPlacesGeoObjects(yaGeoObjects, {
      statusFilter: {
        'dt_military': true,
        'dt_size_violated': false
      },
      showActive: false
    }))
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
          visible: true
        }
      }]);
  });
});
