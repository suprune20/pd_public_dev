'use strict';

angular.module('pdHram')
  .config(function (authRouteProvider) {
    authRouteProvider
      .state('hram.persons', {
        url: '/person',
        templateUrl: 'scripts/modules/hram/persons/templates/list.html',
        controller: ['$scope', '$modal', 'personsProvider', '$state',
          function ($scope, $modal, personsProvider, $state) {
            $scope.persons = [];
            personsProvider.getPersonsCollection()
              .then(function (persons) {
                $scope.persons = persons;
              });
            $scope.addPerson = function () {
              personsProvider.addPerson($scope.newPerson)
                .then(function (addedPersonModel) {
                  $scope.showAddPersonInput = false;
                  $scope.newPerson = null;
                  $scope.persons.unshift(addedPersonModel);
                  $state.go('hram.persons.details', { personId: addedPersonModel.id });
                });
            };
          }
        ],
        menuConfig: 'shopMenu'
      });
  })
;
