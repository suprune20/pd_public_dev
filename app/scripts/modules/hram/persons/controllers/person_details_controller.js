'use strict';

angular.module('pdHram')
  .config(function (authRouteProvider) {
    authRouteProvider
      .state('hram.persons.details', {
        url: '/:personId',
        controller: ['$scope', '$state', '$modal', 'DeadmanMemoryProvider',
          function ($scope, $state, $modal, DeadmanMemoryProvider) {
            var deadmanMemory = new DeadmanMemoryProvider($state.params.personId);

            $modal.open({
              templateUrl: 'views/modules/frontend/client/memory_page.modal.html',
              windowClass: 'burial-memory-modal',
              resolve: {
                deadmanProvider: function () {
                  return deadmanMemory;
                },
                memoryData: function () {
                  return deadmanMemory.getPersonDetails();
                },
                MemoriesProvider: function () {
                  return deadmanMemory.getMemoriesProvider();
                }
              },
              controller: 'MemoryPageCtrl'
            }).result.catch(function () {
              $state.go('hram.persons');
            });
          }
        ],
        menuConfig: 'shopMenu'
      });
  })
;
