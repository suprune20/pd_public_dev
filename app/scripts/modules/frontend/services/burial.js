'use strict';

angular.module('pdFrontend')
  .factory('Burial', function ($http, pdConfig, $timeout, $rootScope) {
    return function (id) {
      return {
        getMemoryDetails: function () {
//          return $http.get(pdConfig.apiEndpoint + 'burial/' + id + '/memory', {
//            tracker: 'commonLoadingTracker'
//          }).then(function (response) {
//            return response.data;
//          });
          var tempMemoryPromise = $timeout(function () {
            var a = {
              photo: null,
              firstname: 'John',
              lastname: 'Smith',
              middlename: null,
              dob: '12-05-1964',
              dod: '1-11-2001',
              commonText: 'RIP John',
              gallery: [
                {
                  photoUrl: 'http://placehold.it/100x100',
                  addedAt: '24-12-2014 12:12:23'
                },
                {
                  photoUrl: 'http://placehold.it/120x120',
                  addedAt: '26-12-2014 12:12:23'
                },
                {
                  photoUrl: 'http://placehold.it/110x110',
                  addedAt: '25-12-2014 12:12:23'
                }
              ]
            };
            a.gallery = _(a.gallery)
              .sortBy('addedAt')
              .reverse()
              .value()
            ;

            return a;
          }, 2000);
          $rootScope.commonLoadingTracker.addPromise(tempMemoryPromise);

          return tempMemoryPromise;
        },
        getMemoriesList: function () {}
      };
    };
  })
;
