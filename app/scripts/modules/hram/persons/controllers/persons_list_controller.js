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
            $scope.$on('updated_person_data', function (event, eventData) {
              var updatedPerson = _.find($scope.persons, {id: eventData.id});

              if (!updatedPerson) {
                return;
              }

              // ToDo: move to model/service
              updatedPerson.firstName = eventData.firstname;
              updatedPerson.lastName = eventData.lastname;
              updatedPerson.middleName = eventData.middlename;
              updatedPerson.titlePhoto = eventData.photo;
            });
          }
        ],
        menuConfig: 'shopMenu'
      });
  })
;
