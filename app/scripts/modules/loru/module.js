'use strict';

angular.module('pdLoru', [
    'ngRoute',
    'pdCommon'
  ])
  .config(function (authRouteProvider) {
    var routeConfig = {
      '': {
        templateUrl: 'views/modules/loru/main.html',
        title: 'Loru'
      },
      '/advertisement': {
        controller: 'LoruAdvertisementCtrl',
        templateUrl: 'views/modules/loru/productplaces/main.html',
        title: 'Реклама'
      },
      '/orgplaces': {
        controller: 'LoruOrgPlacesCtrl',
        templateUrl: 'views/modules/loru/orgplaces/main.html',
        title: 'Места',
        pageClass: 'loru-orgplaces'
      }
    };

    _.forEach(routeConfig, function (routeData, routeUri) {
      authRouteProvider
        .when('/loru' + routeUri, _.merge({
          secured: true,
          menuConfig: 'loruMenu'
        }, routeData || {}), 'ROLE_LORU')
      ;
    });
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

    $rootScope.$on('$routeChangeSuccess', setupMenu);
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
