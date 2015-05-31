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
        menuConfig: 'shopMenu'
      })

      .state('hram.shop', {
        url: '/shop',
        template: '<ui-view/>',
        pageClass: 'shop',
        abstract: true
      })

      .state('hram.place', {
        url: '/place',
        abstract: true,
        template: '<ui-view/>'
      })
      .state('hram.place.list', {
        url: '',
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
        menuConfig: 'shopMenu'
      })
      .state('hram.place.details', {
        url: '/:placeId',
        templateUrl: 'views/modules/frontend/client/places/details.html',
        resolve: {
          placeModel: ['pdFrontendClientPanel', '$stateParams', function (pdFrontendClientPanel, $stateParams) {
            return pdFrontendClientPanel.getPlaceDetails($stateParams.placeId);
          }],
          placesListState: function () {
            return 'hram.place';
          }
        },
        controller: 'ClientPlaceDetailsModalCtrl',
        title: 'Детали места захоронения',
        menuConfig: 'shopMenu'
      })

      .state('hram.persons', {
        url: '/person',
        abstract: true,
        template: '<ui-view/>'
      })

      .state('hram.history', {
        url: '/visit',
        resolve: {
          ordersCollection: ['pdFrontendOrders', function (pdFrontendOrders) {
            return pdFrontendOrders.getOrdersList();
          }],
          orderDetailsState: function () {
            return 'hram.history.details';
          }
        },
        controller: 'ClientOrdersListCtrl',
        templateUrl: 'views/modules/frontend/client/orders/list.html',
        title: 'История заказов',
        secured: true,
        menuConfig: 'shopMenu'
      }, 'ROLE_CLIENT')
      .state('hram.history.details', {
        url: '/:orderId?wsb_order_num&wsb_tid&successPayment&cancelPayment',
        resolve: {
          orderModel: ['pdFrontendOrders', '$stateParams', function (pdFrontendOrders, $stateParams) {
            return pdFrontendOrders.getOrderDetails($stateParams.orderId);
          }],
          ordersListState: function () {
            return 'hram.history';
          }
        },
        controller: 'ClientOrderDetailsCtrl',
        title: 'Информация о заказе',
        secured: true,
        menuConfig: 'shopMenu'
      }, 'ROLE_CLIENT')
    ;
  })
  .run(function ($rootScope, mainMenuManager, pdConfig, auth) {
    var shopMenuConfig = mainMenuManager.addMenuConfig('shopMenu');
    var setupMenu = function () {
      shopMenuConfig.setRightMenuItems([
        {
          type: 'dropdown',
          title: auth.getUserProfile().shortFIO,
          icon: 'glyphicon-user',
          items: [
            {link: '/settings', title: 'Настройки'},
            {class: 'divider'},
            {link: '/signout', title: 'Выйти'}
          ]
        }
      ]);
    };

    shopMenuConfig.setMainMenuItems(pdConfig.menuConfigs.shopMenu.items);

    $rootScope.$on('$stateChangeSuccess', setupMenu);
    $rootScope.$on('auth.signin_success', setupMenu);
  })
;
