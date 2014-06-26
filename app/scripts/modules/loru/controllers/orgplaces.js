'use strict';

angular.module('pdLoru')
  .controller('LoruOrgPlacesCtrl', function ($scope, PdLoruOrgPlaces, modalNotifications, growl) {
    // Show informer when open page
    growl.addInfoMessage('Для добавления новой записи нажмите в нужном месте на карте', {ttl: 10000});

    $scope.pdLoruPlaces = new PdLoruOrgPlaces();
    $scope.addStore = function () {
      $scope.pdLoruPlaces.addNewStoreFromSelected()
        .then(function () {
          growl.addSuccessMessage('Запись была успешно добавлена');
        });
    };
    $scope.saveStore = function () {
      $scope.pdLoruPlaces.saveSelectedStore()
        .then(function () {
          growl.addSuccessMessage('Запись была успешно изменена');
        });
    };
    $scope.removeStore = function () {
      modalNotifications.confirm('Вы уверены, что хотите удалить эту запись?', 'Удаление записи')
        .then(function () {
          // Confirmed remove store
          $scope.pdLoruPlaces.removeSelectedStore()
            .then(function () {
              growl.addSuccessMessage('Запись была успешно удалена');
            });
        });
    };
  })
;
