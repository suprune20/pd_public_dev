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
      .when('/map', {
        controller: 'MapCtrl',
        templateUrl: 'views/modules/frontend/map/main.html',
        reloadOnSearch: false,
        title: 'Карта мест захоронений',
        secured: false,
        setFluidContainer: true,
        pageClass: 'map-page'
      })
      .when('/client-panel', {
        controller: 'ClientPanelCtrl',
        templateUrl: 'views/modules/frontend/client/panel.html',
        title: 'Панель клиента',
        secured: true,
        menuConfig: 'cabinetMenu'
      }, 'ROLE_CLIENT')
      .when('/settings', {
        controller: 'PdFrontendSettingsCtrl',
        templateUrl: 'views/modules/frontend/settings/main.html',
        title: 'Настройки пользователя',
        secured: true,
        menuConfig: 'cabinetMenu',
        pageClass: 'pd-frontend-settings-page',
        resolve: {
          additionalSettingsData: ['settingsProvider', function (settingsProvider) {
            return settingsProvider;
          }]
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

    $rootScope.$on('$routeChangeSuccess', setupMenu);
    $rootScope.$on('auth.signin_success', setupMenu);
  })
;
