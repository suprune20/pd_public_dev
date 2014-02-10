'use strict';

angular.module('pdLoru', [
    'ngRoute',
    'pdCommon'
  ])
  .config(function ($routeProvider) {
    var routeConfig = {
      '': {
        templateUrl: 'views/modules/loru/main.html',
        title: 'Loru'
      },
      '/advertisement': {
        controller: 'LoruAdvertisementCtrl',
        templateUrl: 'views/modules/loru/productplaces/main.html',
        title: 'Реклама'
      }
    };

    _.forEach(routeConfig, function (routeData, routeUri) {
      $routeProvider
        .when('/loru' + routeUri, _.merge({
          secured: true,
          menuConfig: 'loruMenu'
        }, routeData || {}))
      ;
    });
  })
  .run(function ($rootScope, mainMenuManager, pdConfig) {
    mainMenuManager.addMenuConfig('loruMenu', pdConfig.menuConfigs.loruMenu);
  })
;
