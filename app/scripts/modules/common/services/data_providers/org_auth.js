'use strict';

angular.module('pdCommon')
  .factory('OrgAuthSignupModel', function (pdYandex, auth) {
    return function (predefinedOrgType) {
      var officeGeoObject,
        orgTypes = {
          oms: 'Регистрация захоронений',
          loru: 'Учет заказов'
        },
        signupModel = {
          orgType: orgTypes[predefinedOrgType] ? predefinedOrgType : 'loru'
        };

      var getAddress = function (coords) {
        pdYandex.reverseGeocode(coords).then(function (res) {
          signupModel.registredOffice = {
            address: res.text,
            location: {
              longitude: coords[0],
              latitude: coords[1]
            }
          };
        });
      };

      return {
        getOrgTypes: function () {
          return orgTypes[predefinedOrgType] ? null : orgTypes;
        },
        getDirectorPowerSources: function () {
          return {
            charter: 'Устав',
            condition: 'Положение',
            certificate: 'Свидетельство',
            proxy: 'Доверенность'
          };
        },
        yaMapOfficeClickHandle: function (event) {
          if (!officeGeoObject) {
            officeGeoObject = {
              geometry: {
                type: 'Point',
                coordinates: null
              },
              options: {
                preset: 'twirl#redIcon',
                draggable: true
              }
            };
          }

          var coords = event.get('coords');
          officeGeoObject.geometry.coordinates = coords;
          getAddress(coords);
        },
        officeGeoObjectDragendHandler: function (event) {
          getAddress(event.get('target').geometry.getCoordinates());
          officeGeoObject.geometry.coordinates = event.get('target').geometry.getCoordinates();
        },
        getOfficeGeoObject: function () {
          return officeGeoObject;
        },
        getSignupModel: function () {
          return signupModel;
        },
        generatePassword: function () {
          var generatedStr = Math.random().toString(36).substring(2);

          signupModel.password = generatedStr;
          signupModel.passwordConfirm = generatedStr;
        },
        signup: function () {
          var _signupModel = _.cloneDeep(signupModel);

          // Clean some fields in model before upload
          delete _signupModel.passwordConfirm;
          _signupModel.phones = _.map(_signupModel.phones, function (phoneItem) {
            return phoneItem.phone;
          });

          return auth.organisationSignup(_signupModel);
        }
      };
    };
  })
;
