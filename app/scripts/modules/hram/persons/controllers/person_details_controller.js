'use strict';

angular.module('pdHram')
  .config(function (authRouteProvider) {
    authRouteProvider
      .state('hram.persons.details', {
        url: '/:personId',
        templateUrl: 'views/modules/frontend/client/person_memory.html',
        resolve: {
          deadmanProvider: ['DeadmanMemoryProvider', '$stateParams', function (DeadmanMemoryProvider, $stateParams) {
            return new DeadmanMemoryProvider($stateParams.personId);
          }],
          memoryData: ['DeadmanMemoryProvider', '$stateParams', function (DeadmanMemoryProvider, $stateParams) {
            var deadmanMemory = new DeadmanMemoryProvider($stateParams.personId);

            return deadmanMemory.getPersonDetails();
          }],
          MemoriesProvider: ['DeadmanMemoryProvider', '$stateParams', function (DeadmanMemoryProvider, $stateParams) {
            var deadmanMemory = new DeadmanMemoryProvider($stateParams.personId);
            return deadmanMemory.getMemoriesProvider();
          }]
        },
        controller: 'MemoryPageCtrl',
        menuConfig: 'shopMenu'
      });
  })
;
