'use strict';

angular.module('pdFrontend', [
    'ngRoute',
    'pdCommon',
    'ui.select2',
    'infinite-scroll',
    'yaMap',
    'mgcrea.ngStrap.datepicker'
  ])
  .config(function (authRouteProvider) {
    authRouteProvider
      .state('catalog', {
        url: '/?redirectUrl',
        controller: 'CatalogCtrl',
        templateUrl: 'views/modules/frontend/catalog/main.html',
        reloadOnSearch: false,
        title: 'Каталог ритуальных товаров и услуг',
        pageClass: 'catalog-page',
        setFluidContainer: true
      })
      .state('catalog.product', {
        url: 'product/:productId',
        controller: 'CatalogProductCtrl',
        pageClass: 'catalog-page',
        setFluidContainer: true
      })
      .state('map', {
        url: '/map',
        controller: 'MapCtrl',
        templateUrl: 'views/modules/frontend/map/main.html',
        reloadOnSearch: false,
        title: 'Карта мест захоронений',
        secured: false,
        setFluidContainer: true,
        pageClass: 'map-page'
      })
      .state('clientPanel', {
        url: '/client-panel',
        controller: 'ClientPanelCtrl',
        templateUrl: 'views/modules/frontend/client/panel.html',
        title: 'Панель клиента',
        secured: true,
        menuConfig: 'cabinetMenu'
      }, 'ROLE_CLIENT')
      .state('settings', {
        url: '/settings',
        controller: 'PdFrontendSettingsCtrl',
        templateUrl: 'views/modules/frontend/settings/main.html',
        title: 'Настройки пользователя',
        secured: true,
        menuConfig: 'cabinetMenu',
        pageClass: 'pd-frontend-settings-page',
        resolve: {
          additionalSettingsData: function (settingsProvider) {
            return settingsProvider;
          }
        }
      }, 'ROLE_CLIENT')
    ;
  })
  .run(function ($rootScope, mainMenuManager, pdConfig, auth) {
    var cabinetMenuConfig = mainMenuManager.addMenuConfig('cabinetMenu'),
      setupMenu = function () {
        cabinetMenuConfig.setRightMenuItems([
          {
            type: 'dropdown',
            title: auth.getUserProfile().shortFIO,
            icon: 'glyphicon-user',
            items: [
              {link: '#!/settings', title: 'Настройки'},
              {class: 'divider'},
              {link: '#!/signout', title: 'Выйти'}
            ]
          }
        ]);
      };
    cabinetMenuConfig.setMainMenuItems(pdConfig.menuConfigs.cabinetMenu.items);

    $rootScope.$on('$stateChangeSuccess', setupMenu);
    $rootScope.$on('auth.signin_success', setupMenu);
  })
;
