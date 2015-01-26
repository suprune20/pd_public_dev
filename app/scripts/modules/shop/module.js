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
        abstract: true
      })
      .state('shop.main', {
        url: '',
        templateUrl: 'views/modules/shop/main.html',
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
      .state('shop.details', {
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
        controller: ['$scope', 'shopData', function ($scope, shopData) {
          $scope.shop = shopData;
        }]
      })
    ;
  })
  .run(function () {})
;
