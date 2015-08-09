'use strict';

angular.module('pdLoru')
  .service('loruServicesApi', function ($http, pdConfig, $q, auth) {
    function handleErrorResponse(errorResponse) {
      if (400 !== errorResponse.status) {
        return;
      }

      return $q.reject(errorResponse.data.message);
    }

    return {
      getServices: function () {
        return $http.get(pdConfig.apiEndpoint + 'services')
          .then(function (response) {
            return response.data;
          });
      },
      getUserServices: function (orgId) {
        orgId = orgId || auth.getUserOrganisation().id;
        return $http.get(pdConfig.apiEndpoint + 'org/' + orgId + '/services')
          .then(function (response) {
            return response.data;
          });
      },
      postUserService: function (serviceData, orgId) {
        orgId = orgId || auth.getUserOrganisation().id;
        return $http.post(pdConfig.apiEndpoint + 'org/' + orgId + '/services', serviceData)
          .then(function (response) {
            return response.data;
          }, handleErrorResponse);
      },
      putUserService: function (serviceType, serviceData, orgId) {
        orgId = orgId || auth.getUserOrganisation().id;
        return $http.put(pdConfig.apiEndpoint + 'org/' + orgId + '/services/' + serviceType, serviceData)
          .then(function (response) {
            return response.data;
          }, handleErrorResponse);
      },
      deleteUserService: function (serviceType, orgId) {
        orgId = orgId || auth.getUserOrganisation().id;
        return $http.delete(pdConfig.apiEndpoint + 'org/' + orgId + '/services/' + serviceType)
          .catch(handleErrorResponse);
      }
    };
  })
;
