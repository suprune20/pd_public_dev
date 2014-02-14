'use strict';

angular.module('pdAdmin', [
    'ngRoute',
    'pdCommon'
  ])
  .run(function ($rootScope, mainMenuManager, pdConfig) {
    var adminMenuConfig = mainMenuManager.addMenuConfig('loruMenu');
    adminMenuConfig.setMainMenuItems(pdConfig.menuConfigs.adminMenu.items);
    adminMenuConfig.setMenuClass(pdConfig.menuConfigs.adminMenu.navbarClasses);
  })
;
