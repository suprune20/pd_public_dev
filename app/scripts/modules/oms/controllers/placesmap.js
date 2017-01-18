'use strict';

angular.module('pdOms')
    .directive('yaRemoteObject',['$compile', function($compile) {
        return {
            require: '^yaMap',
            restrict: 'E',
            scope: {
                yaSource:'='
            },
            compile:function(tElement) {
                // var childNodes = tElement.contents();
                // tElement.empty();

                return function(scope, element, attrs, yaMap) {
                    yaMap.addGeoObjects(scope.yaSource);
                };
            }
        };
    }])
  .controller('OmsPlacesMapCtrl', function ($scope, omsPlaces, pdConfig, auth) {
    $scope.afterMapInit = function ($target) {
        $scope.remoteObjectManager = new ymaps.RemoteObjectManager(
            'https://org.pohoronnoedelo.ru/api/oms/394/places/clusters?bbox=%b'
            // pdConfig.apiEndpoint + 'oms/' + auth.getUserOrganisation().id + '/places/clusters?bbox=%b'
        );
    };

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
    // omsPlaces.getPlaces().then(function (places) {
    //   $scope.placesGeoObjects = omsPlaces
    //     .filterPlacesGeoObjects(omsPlaces.getYaMapGeoObjectsForPlaces(places), $scope.filters);
    // });
    // $scope.$watch('filters', function (filters) {
    //   if (!$scope.placesGeoObjects) {
    //     return;
    //   }
    //
    //   $scope.placesGeoObjects = omsPlaces.filterPlacesGeoObjects($scope.placesGeoObjects, filters);
    // }, true);
  })
;
