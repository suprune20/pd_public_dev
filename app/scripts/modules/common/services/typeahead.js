'use strict';

angular.module('pdCommon')
  .service('pdTypeahead', function ($http, pdConfig) {
    return {
      getPersonTypeahead: function (query, type) {
        return $http.get(pdConfig.apiEndpoint + '/persons/autocomplete', {
          params: {
            query: query,
            type: type
          }
        }).then(function (response) { return response.data; });
      }
    };
  })
;
