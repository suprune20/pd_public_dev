'use strict';

angular.module('pdOms')
  .controller('OmsPlacesMapCtrl', function ($scope, omsPlaces) {
    // Set initial filters values
    $scope.filters = {
      statusFilter: {
        'dt_size_violated': false,
        'dt_unowned': false,
        'dt_unindentified': false,
        'dt_military': false,
        'dt_wrong_fio': false,
        'dt_free': true
      },
      showActive: true
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
