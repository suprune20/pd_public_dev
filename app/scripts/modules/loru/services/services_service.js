'use strict';

angular.module('pdLoru')
  .service('loruServices', function (loruServicesApi, $q) {
    return {
      getUserServices: function () {
        return $q.all([loruServicesApi.getServices(), loruServicesApi.getUserServices()])
          .then(function (results) {
            var allServices = results[0],
              userServices = results[1];

            return _.map(allServices, function (service) {
              return _.merge(service, _.find(userServices, {type: service.type}) || {});
            });
          });
      },
      updateServiceMeasure: function (serviceType, measureName, price) {
        return loruServicesApi.putUserService(serviceType, {
          measures: [{
            name: measureName,
            price: price
          }]
        });
      },
      activateService: function (serviceType) {
        return loruServicesApi.postUserService({
          type: serviceType
        });
      },
      deactivateService: function (serviceType) {
        return loruServicesApi.deleteUserService(serviceType);
      }
    };
  })
;
