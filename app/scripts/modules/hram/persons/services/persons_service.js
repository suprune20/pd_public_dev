'use strict';

angular.module('pdHram')
  .service('personsApi', function ($http, pdConfig) {
    return {
      getPersons: function () {
        return $http.get(pdConfig.apiEndpoint + 'client/persons')
          .then(function (response) {
            return response.data;
          });
      },
      postPerson: function (personModel) {
        return $http.post(pdConfig.apiEndpoint + 'client/persons', personModel)
          .then(function (response) {
            return response.data;
          });
      }
    };
  })

  .service('personsProvider', function (personsApi) {
    return {
      getPersonsCollection: function () {
        return personsApi.getPersons();
      },
      addPerson: function (personModel) {
        return personsApi.postPerson(personModel);
      }
    };
  })
;
