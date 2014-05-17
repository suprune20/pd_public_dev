'use strict';

describe('Factory: PdLoruOrgPlaces', function () {
  var orgplacesService,
    pdYandexMock,
    pdLoruStoresApiMock,
    storesListData = [
      {
        id: 1,
        name: 'store1',
        address: 'address of store1',
        location: {
          latitude: 53.9198789428135,
          longitude: 27.5772733471753
        },
        phones: ['1231231231']
      }, {
        id: 2,
        name: 'store2',
        address: 'address of store2',
        location: {
          latitude: 53.9198789428135,
          longitude: 27.5772733471753
        },
        phones: []
      }
    ],
    addStoreCbReturnData,
    saveStoreCbReturnData;
  var selectStoreGeoObject = function (storeId) {
      // event.get('target').properties.get('placeData.id')
      // select geo object marker with id
      var event = {
        get: function () {
          return {
            properties: {
              get: function () {
                return storeId;
              }
            }
          };
        }
      };

      orgplacesService.selectGeoObjectEvent(event);
    },
    addChangeStoreGeoObjectMarker = function (coords) {
      // event.get('coords');
      var event = {
        get: function () {
          return coords;
        }
      };

      orgplacesService.addStoreYaMapEvent(event);
    };

  beforeEach(function () {
    pdYandexMock = {
      geocode: jasmine.createSpy('pdYandexMock mock for "geocode" method'),
      reverseGeocode: jasmine.createSpy('pdYandexMock mock for "reverseGeocode" method').andReturn({
        then: jasmine.createSpy('pdLoruStoresApi: getStores promise then mock')
      })
    };
    pdLoruStoresApiMock = {
      getStores: jasmine.createSpy('pdLoruStoresApi: getStores mock').andReturn({
        then: jasmine.createSpy('pdLoruStoresApi: getStores promise then mock').andCallFake(function (cb) {
          cb(storesListData);
        })
      }),
      addStore: jasmine.createSpy('pdLoruStoresApi: addStore mock').andReturn({
        then: jasmine.createSpy('pdLoruStoresApi: addStore promise then mock').andCallFake(function (cb) {
          cb(addStoreCbReturnData);
        })
      }),
      saveStore: jasmine.createSpy('pdLoruStoresApi: saveStore mock').andReturn({
        then: jasmine.createSpy('pdLoruStoresApi: saveStore promise then mock').andCallFake(function (cb) {
          cb(saveStoreCbReturnData);
        })
      }),
      removeStore: jasmine.createSpy('pdLoruStoresApi: removeStore mock').andReturn({
        then: jasmine.createSpy('pdLoruStoresApi: removeStore promise then mock').andCallFake(function (cb) {
          cb(saveStoreCbReturnData);
        })
      })
    };
  });
  beforeEach(module('pdLoru', function ($provide) {
    $provide.value('pdLoruStoresApi', pdLoruStoresApiMock);
    $provide.value('pdYandex', pdYandexMock);
  }));
  beforeEach(inject(function (PdLoruOrgPlaces) {
    orgplacesService = new PdLoruOrgPlaces();
  }));

  it('should get all stores data when create instance of factory', function () {
    expect(pdLoruStoresApiMock.getStores).toHaveBeenCalled();
  });

  it('should get stores geo object', function () {
    expect(orgplacesService.getStoresGeoObjects().length).toEqual(2);
  });

  it('should allow select store on the map', function () {
    selectStoreGeoObject(1);
    expect(orgplacesService.getSelectedPlaceGeoObject().properties.placeData.id).toEqual(1);
  });

  it('should allow add new store to the map', function () {
    addChangeStoreGeoObjectMarker([53, 23]);
    expect(orgplacesService.getSelectedPlaceGeoObject().geometry.coordinates).toEqual([53, 23]);
  });

  it('should save new store from selected geo object', function () {
    addStoreCbReturnData = {
      id: 123,
      name: 'store123',
      address: 'address of store123',
      location: {
        latitude: 3.9198789428135,
        longitude: 2.5772733471753
      },
      phones: []
    };
    selectStoreGeoObject(1);
    orgplacesService.addNewStoreFromSelected();

    expect(pdLoruStoresApiMock.addStore).toHaveBeenCalled();
    // Reset selected geoobject
    expect(orgplacesService.getSelectedPlaceGeoObject()).toBeNull();
    // add added store geoobject into stores geo objects
    expect(orgplacesService.getStoresGeoObjects().length).toEqual(3);
  });

  it('should save changed geo object of the store', function () {
    selectStoreGeoObject(1);
    addChangeStoreGeoObjectMarker([53, 23]);
    storesListData[0].location = {
      latitude: 23,
      longitude: 53
    };
    saveStoreCbReturnData = storesListData[0];
    orgplacesService.saveSelectedStore();

    expect(pdLoruStoresApiMock.saveStore).toHaveBeenCalled();
    // Changed object in geo objects collection
    var changedGeoObject;
    orgplacesService.getStoresGeoObjects().forEach(function (geoObject) {
      if (1 === geoObject.properties.placeData.id) {
        changedGeoObject = geoObject;
      }
    });
    expect(changedGeoObject.geometry.coordinates).toEqual([53, 23]);
    // Reset selected geo object marker
    expect(orgplacesService.getSelectedPlaceGeoObject()).toBeNull();
  });

  it('should remove selected store from stores collections', function () {
    selectStoreGeoObject(1);
    orgplacesService.removeSelectedStore();

    expect(pdLoruStoresApiMock.removeStore).toHaveBeenCalledWith(1);
    // Remove geoObject from collection
    expect(orgplacesService.getStoresGeoObjects().length).toEqual(1);
    // Reset selected geo object marker
    expect(orgplacesService.getSelectedPlaceGeoObject()).toBeNull();
  });
});
