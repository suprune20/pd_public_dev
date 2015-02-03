'use strict';

angular.module('pdShop', [
    'ngRoute',
    'pdCommon'
  ])
  .config(function (authRouteProvider) {
    authRouteProvider
      .state('shop', {
        url: '/shop',
        template: '<ui-view/>',
        pageClass: 'shop',
        abstract: true
      })
      .state('shop.history', {
        url: '/history',
        templateUrl: 'views/modules/shop/history.html',
        controller: function () {}
      })
      .state('shop.main', {
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
        abstract: true,
        menuConfig: 'shopMenu'
      })
      .state('shop.main.list', {
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
        }],
        menuConfig: 'shopMenu'
      })
      .state('shop.main.details', {
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
        }],
        menuConfig: 'shopMenu'
      })
    ;
  })
  .run(function ($rootScope, mainMenuManager, pdConfig) {
    var shopMenu = mainMenuManager.addMenuConfig('shopMenu');

    $rootScope.$on('$stateChangeSuccess', function () {
      shopMenu.setMainMenuItems(pdConfig.menuConfigs.shopMenu.items);
    });
  })
;
