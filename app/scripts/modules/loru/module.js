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
        controller: 'pdCommonOrgPlacesCtrl',
        templateUrl: 'views/modules/common/orgplaces/main.html',
        title: 'Подразделения',
        pageClass: 'org-orgplaces'
      },

      // PRODUCTS MANAGEMENT
      'loru.products': {
        url: '/products',
        abstract: true,
        template: '<ui-view/>',
        controller: ['$scope', function ($scope) {
          $scope.filters = {
            selectedCategories: {}
          };
        }]
      },
      'loru.products.list': {
        url: '',
        resolve: {
          categories: ['pdFrontendCatalogApi', function (pdFrontendCatalogApi) {
            return pdFrontendCatalogApi.getCategories();
          }],
          userServices: ['loruServices', function (loruServices) {
            return loruServices.getUserServices();
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

      'loru.own_orders_add': {
        url: '/own-orders/add',
        resolve: {
            categories: ['loruOrders', function (loruOrders) {
                return loruOrders.getCategoriesWithProducts()
                    .then(function (categories) {
                        return _.filter(categories, function (category) {
                            return !!category.products.length;
                        });
                    });
            }],
            order: function () {
                return {
                    createdDate: moment().format('DD.MM.YYYY'),
                    products: []
                };
            }
        },
        controller: 'LoruOwnOrderCtrl',
        templateUrl: 'views/modules/loru/orders/add.html',
        title: 'Добавление заказа',
        pageClass: 'loru-own-orders'
      },

      'loru.own_orders_edit': {
        url: '/own-orders/:orderId',
        resolve: {
            categories: ['loruOrders', function (loruOrders) {
                return loruOrders.getCategoriesWithProducts()
                    .then(function (categories) {
                        return _.filter(categories, function (category) {
                            return category.products.length;
                        });
                    });
            }],
            order: ['$stateParams', 'loruOrders', function ($stateParams, loruOrders) {
                return loruOrders.getOrder($stateParams.orderId);
            }]
        },
        controller: 'LoruOwnOrderCtrl',
        templateUrl: 'views/modules/loru/orders/edit.html',
        title: 'Редактирование заказа',
        pageClass: 'loru-own-orders'
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
        },
        setFluidContainer: true
      }, ['ROLE_LORU', 'ROLE_SUPERVISOR'])
      .state('orders.retail', {
        url: '/:orderId',
        secured: true,
        title: 'Информация о заказе',
        resolve: {
          orderModel: ['pdFrontendOrders', '$stateParams', function (pdFrontendOrders, $stateParams) {
            return pdFrontendOrders.getOrderDetails($stateParams.orderId);
          }]
        },
        controller: 'pdLoruRetailOrderDetails',
        setFluidContainer: true
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
              return optMarketplace.getOrder($stateParams.orderId)
                .then(function (orderModel) {
                  return $q.all([
                    optMarketplace.getSupplierStore(orderModel.supplier.id),
                    pdFrontendCatalogApi.getCategories({
                      supplier: orderModel.supplier.id,
                      onlyOpt: true
                    })
                  ]).then(function (results) {
                      return {
                        order: orderModel,
                        categories: results[1],
                        supplierStore: results[0]
                      };
                    });
                });
            }
          ],
          cart: ['OptMarketplaceCart', function (OptMarketplaceCart) {
            return new OptMarketplaceCart();
          }]
        },
        setFluidContainer: true
      }, ['ROLE_LORU', 'ROLE_SUPERVISOR'])
    ;

    // PRICE
    authRouteProvider
      .state('price', {
        url: '/price/:supplierId?category',
        resolve: {
          supplierStore: ['optMarketplace', '$stateParams', function (optMarketplace, $stateParams) {
            return optMarketplace.getSupplierStore(
              $stateParams.supplierId,
              $stateParams.category ? {category: $stateParams.category.split(',')} : null
            );
          }],
          selectedCategoriesFilter: ['$stateParams', function ($stateParams) {
            return $stateParams.category ? $stateParams.category.split(',') : [];
          }],
          cart: ['OptMarketplaceCart', function (OptMarketplaceCart) {
            return new OptMarketplaceCart();
          }],
          categories: ['pdFrontendCatalogApi', '$stateParams', function (pdFrontendCatalogApi, $stateParams) {
            return pdFrontendCatalogApi.getCategories({
              supplier: $stateParams.supplierId,
              onlyOpt: true
            });
          }],
          supplierDetails: ['optMarketplace', '$stateParams', function (optMarketplace, $stateParams) {
            return optMarketplace.getSupplier($stateParams.supplierId);
          }],
          suppliers: ['optMarketplace', function (optMarketplace) {
            return optMarketplace.getSuppliers();
          }]
        },
        controller: 'OptMarketplacePriceCtrl',
        templateUrl: 'views/modules/loru/opt_marketplace/supplier_store.html',
        reloadOnSearch: false,
        setFluidContainer: true
      });
  })
  .run(function ($rootScope, mainMenuManager, pdConfig, serverConfig, auth, growl, pdLoruSupplier) {
    var loruMenuConfig = mainMenuManager.addMenuConfig('loruMenu'),
      setupMenu = function (favoriteSuppliers) {
        if (!auth.isCurrentHasLoruRole()) {
          return;
        }

        var userOrgId = auth.getUserOrganisation().id;
        loruMenuConfig.setRightMenuItems([
          {link: '#!/loru/advertisement', title: 'Реклама'},
          {link: '#!/', title: 'Каталог', orgAbility: 'trade'},
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
              {link: '#!/loru/orgplaces', title: 'Подразделения', orgAbility: 'trade'},
              {link: '/loru/products', title: 'Товары и услуги', orgAbility: 'trade'},
              {link: serverConfig.serverHost + 'org/log', title: 'Журнал'},
              {class: 'divider'},
              {link: '/price/' + userOrgId, title: 'Интернет-магазин', items: favoriteSuppliers, orgAbility: 'trade'},
              {link: '#!/orders', title: 'Архив заказов', orgAbility: 'trade'},
              {link: '/loru/own-orders/add', title: 'Заказ похорон'},
              {class: 'divider'},
              {link: '#!/signout', title: 'Выйти'}
            ]
          }
        ]);
      };

    $rootScope.updateLoruFavoritesMenu = function () {
      pdLoruSupplier.getFavoritesSuppliers()
        .then(function (suppliersCollection) {
          var favoriteSuppliers = _.map(suppliersCollection, function (supplierData) {
            return {
              link: '/price/' + supplierData.id,
              title: supplierData.name
            };
          });

          if (favoriteSuppliers.length) {
            setupMenu(favoriteSuppliers);
          }
        });
    };
    if (auth.isCurrentHasLoruRole()) {
      $rootScope.updateLoruFavoritesMenu();
    }

    loruMenuConfig.setMainMenuItems(pdConfig.menuConfigs.loruMenu.items);
    loruMenuConfig.setMenuClass(pdConfig.menuConfigs.loruMenu.navbarClasses);

    $rootScope.$on('$stateChangeSuccess', function () {
      if (!auth.isCurrentHasLoruRole()) {
        return;
      }

      $rootScope.updateLoruFavoritesMenu();
    });
    // Show notification about learn "How add advert"
    $rootScope.$on('auth.signin_success', function () {
      if (!auth.isCurrentHasLoruRole()) {
        return;
      }

      $rootScope.updateLoruFavoritesMenu();
    });
  })
;
