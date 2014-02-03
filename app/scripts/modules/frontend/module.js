'use strict';

angular.module('pdFrontend', [
    'ngRoute',
    'pdCommon',
    'ui.select2',
    'infinite-scroll',
    'yaMap'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/catalog', {
        controller: 'CatalogCtrl',
        templateUrl: 'views/modules/frontend/catalog/main.html',
        reloadOnSearch: false,
        title: 'Каталог',
        secured: true,
        menuConfig: 'cabinetMenu'
      })
      .when('/client-panel', {
        controller: 'ClientPanelCtrl',
        templateUrl: 'views/modules/frontend/client/panel.html',
        title: 'Панель клиента',
        secured: true,
        menuConfig: 'cabinetMenu'
      })
    ;
  })
  .run(function ($rootScope, mainMenuManager, pdConfig) {
    mainMenuManager.addMenuConfig('cabinetMenu', pdConfig.menuConfigs.cabinetMenu);
  })
;