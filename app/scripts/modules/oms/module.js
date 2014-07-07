'use strict';

angular.module('pdOms', [
  'ngRoute',
  'pdCommon'
])
  .config(function (authRouteProvider) {
    var routeConfig = {
      '/': {
        resolve: {
          redirect: ['$window', 'pdConfig', function ($window, pdConfig) {
            $window.location.href = pdConfig.backendUrl;
          }]
        }
      },
      '/placesmap': {
        controller: 'OmsPlacesMapCtrl',
        templateUrl: 'views/modules/oms/placesmap/main.html',
        title: 'Инвентаризация',
        pageClass: 'oms-placesmap'
      }
    };

    _.forEach(routeConfig, function (routeData, routeUri) {
      authRouteProvider
        .when('/oms' + routeUri, _.merge({
          secured: true,
          menuConfig: 'omsMenu'
        }, routeData || {}), 'ROLE_OMS')
      ;
    });
  })
  .run(function ($rootScope, mainMenuManager, pdConfig, serverConfig, auth) {
    var omsMenuConfig = mainMenuManager.addMenuConfig('omsMenu'),
      setupMenu = function () {
        var userOrgId = auth.getUserOrganisation().id;

        omsMenuConfig.setRightMenuItems([
          {link: serverConfig.serverHost + 'manage/cemetery', title: 'Кладбища'},
          {
            type: 'dropdown',
            title: auth.getUserProfile().shortFIO,
            icon: 'glyphicon-user',
            items: [
              {link: '#/oms/placesmap', title: 'Карта захоронений'},
              {link: serverConfig.serverHost + 'loruregistry', title: 'Реестр ЛОРУ'},
              {
                link: serverConfig.serverHost + 'org/' + userOrgId + '/edit',
                title: 'Организация',
                hide: !userOrgId
              },
              {link: serverConfig.serverHost + 'userprofile', title: 'Пользователь'},
              {link: serverConfig.serverHost + 'org/log', title: 'Журнал'},
              {class: 'divider'},
              {link: '#/signout', title: 'Выйти'}
            ]
          }
        ]);
      };

    omsMenuConfig.setMainMenuItems(pdConfig.menuConfigs.omsMenu.items);
    omsMenuConfig.setMenuClass(pdConfig.menuConfigs.omsMenu.navbarClasses);
    $rootScope.$on('$routeChangeSuccess', setupMenu);
    $rootScope.$on('auth.signin_success', setupMenu);
  })
;
