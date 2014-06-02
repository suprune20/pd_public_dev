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
      '/signup': {
        controller: 'LoruSignupCtrl',
        templateUrl: 'views/modules/loru/auth/signup.html',
        title: 'Регистрация ЛОРУ',
        secured: false,
        menuConfig: 'emptyMenu'
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
            {link: '#/loru/orgplaces', title: 'Склады'},
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
