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
  .run(function ($rootScope, mainMenuManager, pdConfig, serverConfig, auth) {
    var loruMenuConfig = mainMenuManager.addMenuConfig('loruMenu');

    loruMenuConfig.setMainMenuItems(pdConfig.menuConfigs.loruMenu.items);
    loruMenuConfig.setMenuClass(pdConfig.menuConfigs.loruMenu.navbarClasses);

    $rootScope.$on('$routeChangeSuccess', function () {
      var userOrgId = auth.getUserOrganisation().id;

      loruMenuConfig.setRightMenuItems([
        {link: '#/loru/advertisement', title: 'Реклама'},
        {
          type: 'dropdown',
          title: auth.getUserProfile().lastname || '',
          icon: 'glyphicon-user',
          items: [
            {
              link: serverConfig.serverHost + 'org/' + userOrgId + '/edit',
              title: 'Организация',
              hide: !userOrgId
            },
            {link: serverConfig.serverHost + 'userprofile', title: 'Пользователь'},
            {link: serverConfig.serverHost + 'manage/product', title: 'Товары и услуги'},
            {link: serverConfig.serverHost + 'org/log', title: 'Журнал'},
            {class: 'divider'},
            {link: '#/signout', title: 'Выйти'}
          ]
        }
      ]);
    });
  })
;
