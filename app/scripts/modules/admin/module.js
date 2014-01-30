'use strict';

angular.module('pdAdmin', [
    'ngRoute',
    'pdCommon'
  ])
  .run(function ($rootScope, mainMenuManager, pdConfig) {
    mainMenuManager.addMenuConfig('adminMenu', pdConfig.menuConfigs.adminMenu);
  })
;
