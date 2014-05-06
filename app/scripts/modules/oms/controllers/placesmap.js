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
        'dt_wrong_fio': true
      },
      showActive: true
    };
    omsPlaces.getPlaces().then(function (places) {
      $scope.placesGeoObjects = omsPlaces.filterPlacesGeoObjects(
        omsPlaces.getYaMapGeoObjectsForPlaces(places),
        $scope.filters.statusFilter
      );
    });
    $scope.$watchCollection(function () { return $scope.filters.statusFilter; }, function (statusFilter) {
      if (!$scope.placesGeoObjects) {
        return;
      }

      $scope.placesGeoObjects = omsPlaces.filterPlacesGeoObjects($scope.placesGeoObjects, statusFilter);
    });
    $scope.$watch(function () { return $scope.filters.showActive; }, function (showActivePlaces) {
      $scope.filters.statusFilter = _.mapValues($scope.filters.statusFilter, function () {
        return showActivePlaces;
      });
    });
  })
;
