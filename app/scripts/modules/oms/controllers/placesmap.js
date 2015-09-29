'use strict';

angular.module('pdOms')
  .controller('OmsPlacesMapCtrl', function ($scope, omsPlaces) {
    // Set initial filters values
    $scope.filters = {
      statusFilter: {
        'dt_size_violated': true,
        'dt_unowned': true,
        'dt_unindentified': true,
        'dt_military': true,
        'dt_wrong_fio': true,
        'dt_free': true
      },
      showActive: false
    };
    omsPlaces.getPlaces().then(function (places) {
      $scope.placesGeoObjects = omsPlaces
        .filterPlacesGeoObjects(omsPlaces.getYaMapGeoObjectsForPlaces(places), $scope.filters);
    });
    $scope.$watch('filters', function (filters) {
      if (!$scope.placesGeoObjects) {
        return;
      }

      $scope.placesGeoObjects = omsPlaces.filterPlacesGeoObjects($scope.placesGeoObjects, filters);
    }, true);
  })
;
