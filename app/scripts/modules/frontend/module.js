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
      .when('/catalog', {
        controller: 'CatalogCtrl',
        templateUrl: 'views/modules/frontend/catalog/main.html',
        reloadOnSearch: false,
        title: 'Каталог',
        secured: false,
        menuConfig: 'cabinetMenu',
        hideMainMenu: true,
        hideRootContainerClass: true
      })
      .when('/client-panel', {
        controller: function () {console.log('aaaa');},//'ClientPanelCtrl',
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
        pageClass: 'pd-frontend-settings-page'
      }, 'ROLE_CLIENT')
    ;
  })
  .run(function ($rootScope, mainMenuManager, pdConfig, auth) {
    var cabinetMenuConfig = mainMenuManager.addMenuConfig('cabinetMenu');
    cabinetMenuConfig.setMainMenuItems(pdConfig.menuConfigs.cabinetMenu.items);

    $rootScope.$on('$routeChangeSuccess', function () {
      cabinetMenuConfig.setRightMenuItems([
        {
          type: 'dropdown',
          title: auth.getUserProfile().lastname || '',
          icon: 'glyphicon-user',
          items: [
            {link: '#/settings', title: 'Настройки'},
            {class: 'divider'},
            {link: '#/signout', title: 'Выйти'}
          ]
        }
      ]);
    });
  })
;
