'use strict';

angular.module('pdHram')
  .config(function (authRouteProvider) {
    authRouteProvider
      .state('hram.shop.main.details', {
        url: '/:shopId',
        templateUrl: 'scripts/modules/hram/shop/templates/details.html',
        resolve: {
          shopData: function ($stateParams, shopProvider) {
            return shopProvider.getShopDetails($stateParams.shopId);

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
      });
  })
;
