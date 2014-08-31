'use strict';

angular.module('pdLoru', [
    'ngRoute',
    'pdCommon'
  ])
  .config(function (authRouteProvider) {
    var routeConfig = {
      'loru': {
        url: '/loru',
        template: '<ui-view><h1>Рабочее место пользователя</h1></ui-view>'
      },
      'loru.advertisement': {
        url: '/advertisement',
        controller: 'LoruAdvertisementCtrl',
        templateUrl: 'views/modules/loru/productplaces/main.html',
        title: 'Реклама'
      },
      'loru.orgplaces': {
        url: '/orgplaces',
        controller: 'LoruOrgPlacesCtrl',
        templateUrl: 'views/modules/loru/orgplaces/main.html',
        title: 'Места',
        pageClass: 'loru-orgplaces'
      },

      // PRODUCTS MANAGEMENT
      'loru.products': {
        url: '/products',
        abstract: true,
        template: '<ui-view/>'
      },
      'loru.products.list': {
        url: '',
        resolve: {
          products: ['loruProducts', function (loruProducts) { return loruProducts.getProducts(); }],
          categories: ['pdFrontendCatalogApi', function (pdFrontendCatalogApi) {
            return pdFrontendCatalogApi.getCategories();
          }]
        },
        controller: 'LoruProductsListCtrl',
        templateUrl: 'views/modules/loru/products/list.html',
        title: 'Список товаров и услуг',
        setFluidContainer: true
      },
      'loru.products.add': {
        url: '/create',
        resolve: {
          productsTypes: ['loruProductsApi', function (loruProductsApi) {
            return loruProductsApi.getProductsTypes();
          }],
          categories: ['pdFrontendCatalogApi', function (pdFrontendCatalogApi) {
            return pdFrontendCatalogApi.getCategories();
          }]
        },
        controller: 'LoruProductAddCtrl',
        templateUrl: 'views/modules/loru/products/add.html',
        title: 'Добавление товара/услуги'
      },
      'loru.products.edit': {
        url: '/:productId',
        resolve: {
          product: ['$stateParams', 'loruProducts', function ($stateParams, loruProducts) {
            return loruProducts.getProduct($stateParams.productId);
          }],
          productsTypes: ['loruProductsApi', function (loruProductsApi) {
            return loruProductsApi.getProductsTypes();
          }],
          categories: ['pdFrontendCatalogApi', function (pdFrontendCatalogApi) {
            return pdFrontendCatalogApi.getCategories();
          }]
        },
        controller: 'LoruProductEditCtrl',
        templateUrl: 'views/modules/loru/products/edit.html',
        title: 'Редактирование товара/услуги'
      },

      // PRICE
      'price': {
        url: '/price/:supplierId',
        resolve: {
          supplierStore: ['optMarketplace', '$stateParams', function (optMarketplace, $stateParams) {
            return optMarketplace.getSupplierStore($stateParams.supplierId);
          }],
          cart: ['OptMarketplaceCart', function (OptMarketplaceCart) {
            return new OptMarketplaceCart();
          }],
          categories: ['pdFrontendCatalogApi', function (pdFrontendCatalogApi) {
            return pdFrontendCatalogApi.getCategories();
          }]
        },
        controller: 'OptMarketplacePriceCtrl',
        templateUrl: 'views/modules/loru/opt_marketplace/supplier_store.html'
      }
    };

    _.forEach(routeConfig, function (stateParams, stateName) {
      authRouteProvider
        .state(stateName, _.merge({
          secured: true,
          menuConfig: 'loruMenu'
        }, stateParams || {}), ['ROLE_LORU', 'ROLE_SUPERVISOR']);
    });

    authRouteProvider
      .state('orders', {
        url: '/orders',
        secured: true,
        templateUrl: 'views/modules/loru/opt_marketplace/my_orders.html',
        controller: 'OptMarketplaceMyOrdersCtrl',
        title: 'Мои заказы',
        resolve: {
          ordersCollection: ['optMarketplace', function (optMarketplace) {
            return optMarketplace.getMyOrders();
          }]
        }
      }, ['ROLE_LORU', 'ROLE_SUPERVISOR'])
      .state('order', {
        url: '/order/:orderId',
        secured: true,
        templateUrl: 'views/modules/loru/opt_marketplace/order_edit.html',
        controller: 'OptMarketplaceOrderEditCtrl',
        title: 'Редактирование заказа',
        resolve: {
          pageData: ['optMarketplace', 'pdFrontendCatalogApi', '$stateParams', '$q',
            function (optMarketplace, pdFrontendCatalogApi, $stateParams, $q) {
              return $q.all([optMarketplace.getOrder($stateParams.orderId), pdFrontendCatalogApi.getCategories()])
                .then(function (results) {
                  var orderModel = results[0];

                  return optMarketplace.getSupplierStore(orderModel.supplierId)
                    .then(function (supplierStoreData) {
                      return {
                        order: orderModel,
                        categories: results[1],
                        supplierStore: supplierStoreData
                      };
                    });
                });
            }
          ],
          cart: ['OptMarketplaceCart', function (OptMarketplaceCart) {
            return new OptMarketplaceCart();
          }]
        }
      }, ['ROLE_LORU', 'ROLE_SUPERVISOR'])
    ;
  })
  .run(function ($rootScope, mainMenuManager, pdConfig, serverConfig, auth, growl) {
    var loruMenuConfig = mainMenuManager.addMenuConfig('loruMenu'),
      setupMenu = function () {
        var userOrgId = auth.getUserOrganisation().id;

        loruMenuConfig.setRightMenuItems([
          {link: '#!/loru/advertisement', title: 'Реклама'},
          {link: '#!/', title: 'Каталог'},
          {
            type: 'dropdown',
            title: auth.getUserProfile().shortFIO,
            icon: 'glyphicon-user',
            items: [
              {
                link: serverConfig.serverHost + 'org/' + userOrgId + '/edit',
                title: 'Организация',
                hide: !userOrgId
              },
              {link: serverConfig.serverHost + 'userprofile', title: 'Пользователь'},
              {link: '#!/loru/orgplaces', title: 'Склады'},
              {link: serverConfig.serverHost + 'manage/product', title: 'Товары и услуги'},
              {link: serverConfig.serverHost + 'org/log', title: 'Журнал'},
              {class: 'divider'},
              {link: '#!/signout', title: 'Выйти'}
            ]
          }
        ]);
      };

    loruMenuConfig.setMainMenuItems(pdConfig.menuConfigs.loruMenu.items);
    loruMenuConfig.setMenuClass(pdConfig.menuConfigs.loruMenu.navbarClasses);

    $rootScope.$on('$stateChangeSuccess', setupMenu);
    $rootScope.$on('auth.signin_success', setupMenu);
    // Show notification about learn "How add advert"
    $rootScope.$on('auth.signin_success', function () {
      if (!auth.isCurrentHasLoruRole()) {
        return;
      }

      var tutorialLink = pdConfig.backendUrl + 'tutorial#chapter2';
      growl.addInfoMessage(
        'Уважаемый пользователь, посмотрите, пожалуйста, наше обучающее видео "<a href="' +
          tutorialLink + '">Как разместить рекламу"</a>',
        {enableHtml: true, ttl: 15000}
      );
    });
  })
;
