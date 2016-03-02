'use strict';

angular.module('pdCommon')
  .controller('pdCommonOrgPlacesCtrl', function ($scope, PdCommonOrgPlaces, modalNotifications, growl) {
    // Show informer when open page
    growl.addInfoMessage('Для добавления новой записи нажмите в нужном месте на карте', {ttl: 10000});

    $scope.pdOrgPlaces = new PdCommonOrgPlaces();
    $scope.addStore = function () {
      $scope.pdOrgPlaces.addNewStoreFromSelected()
        .then(function () {
          growl.addSuccessMessage('Запись была успешно добавлена');
        });
    };
    $scope.saveStore = function () {
      $scope.pdOrgPlaces.saveSelectedStore()
        .then(function () {
          growl.addSuccessMessage('Запись была успешно изменена');
        });
    };
    $scope.removeStore = function () {
      modalNotifications.confirm('Вы уверены, что хотите удалить эту запись?', 'Удаление записи')
        .then(function () {
          // Confirmed remove store
          $scope.pdOrgPlaces.removeSelectedStore()
            .then(function () {
              growl.addSuccessMessage('Запись была успешно удалена');
            });
        });
    };
  })
;
