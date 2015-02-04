'use strict';

angular.module('pdHram', [
    'ngRoute',
    'pdCommon'
  ])
  .config(function (authRouteProvider) {
    authRouteProvider
      .state('hram', {
        url: '/hram',
        template: '<ui-view>',
        abstract: true
      })

      .state('hram.shop', {
        url: '/shop',
        template: '<ui-view/>',
        pageClass: 'shop',
        abstract: true
      })
      .state('hram.shop.history', {
        url: '/visit',
        templateUrl: 'views/modules/shop/history.html',
        controller: function () {}
      })
      .state('hram.shop.main', {
        url: '',
        templateUrl: 'views/modules/shop/layout.html',
        controller: ['$scope', function ($scope) {
          $scope.setPlaceMarker = function (event) {
            $scope.selectedPlaceMarker = {
              geometry: {
                type: 'Point',
                coordinates: event.get('coords')
              },
              properties: {
                type: 'users_place'
              },
              options: {
                preset: 'twirl#redIcon',
                draggable: true
              }
            };
          };
        }],
        abstract: true
      })
      .state('hram.shop.main.list', {
        url: '',
        templateUrl: 'views/modules/shop/list.html',
        controller: ['$scope', function ($scope) {
          $scope.shops = [];
          for (var i = 1; i < 10; i++) {
            $scope.shops.push({
              id: i,
              title: 'Магазин ' + i,
              price: parseFloat(Math.random() * 1000).toFixed(2)
            });
          }
        }]
      })
      .state('hram.shop.main.details', {
        url: '/:shopId',
        templateUrl: 'views/modules/shop/details.html',
        resolve: {
          shopData: function () {
            return {
              id: 123,
              title: 'Магазин 123',
              gallery: [
                'http://lorempixel.com/400/200',
                'http://lorempixel.com/400/210',
                'http://lorempixel.com/400/205',
                'http://lorempixel.com/400/206'
              ],
              services: [
                {
                  id: 1,
                  title: 'Заказ фотографии',
                  price: parseFloat(Math.random() * 1000).toFixed(2)
                },
                {
                  id: 2,
                  title: 'Венок',
                  price: parseFloat(Math.random() * 1000).toFixed(2)
                }
              ],
              reviews: [
                {
                  user: {
                    firstName: 'Иван',
                    lastName: 'Иванов'
                  },
                  title: 'Ужасно',
                  createdAt: '2015-01-24T23:57:02+00:00',
                  comment: {
                    positive: 'Очень быстро выполнился заказ',
                    negative: 'Ужасное качество исполнения'
                  }
                }
              ]
            };
          }
        },
        controller: ['$scope', 'shopData', '$modal', function ($scope, shopData, $modal) {
          $scope.shop = shopData;
          $scope.services = _.map(shopData.services, function (service) {
            return {
              service: service,
              isSelected: false
            };
          });
          $scope.$watch('services', function (services) {
            $scope.isSelectedAnyServices = _.some(services, 'isSelected');
          }, true);

          $scope.placeOrder = function () {
            $modal.open({
              templateUrl: 'views/modules/shop/place_order.modal.html',
              controller: function () {}
            });
          };
        }]
      })

      .state('hram.place', {
        url: '/place',
        resolve: {
          placesData: ['pdFrontendClientPanel', function (pdFrontendClientPanel) {
            return pdFrontendClientPanel.getPlacesCollection();
          }],
          placeDetailsState: function () {
            return 'hram.place.details';
          }
        },
        controller: 'ClientPanelCtrl',
        templateUrl: 'views/modules/frontend/client/panel.html',
        title: 'Места',
        secured: true
      }, 'ROLE_CLIENT')
      .state('hram.place.details', {
        url: '/:placeId',
        resolve: {
          placeData: ['pdFrontendClientPanel', '$stateParams', function (pdFrontendClientPanel, $stateParams) {
            return pdFrontendClientPanel.getPlaceDetails($stateParams.placeId);
          }],
          placesListState: function () {
            return 'hram.place';
          }
        },
        controller: 'ClientPlaceDetail',
        title: 'Детали места захоронения'
      }, 'ROLE_CLIENT')

      .state('hram.persons', {
        url: '/person',
        templateUrl: 'views/modules/hram/persons/list.html',
        controller: ['$scope', '$modal', function ($scope, $modal) {
          $scope.persons = [];
          for (var i = 0; i < 15; i++) {
            $scope.persons.push({
              imageUrl: 'http://placehold.it/500x500'
            });
          }
          $scope.addPerson = function () {
            $modal.open({
              templateUrl: 'views/modules/hram/persons/add_person.modal.html',
              controller: function () {}
            });
          };
        }]
      })
    ;
  })
  .run(function () {})
;
