'use strict';

angular.module('pdOms', [
  'ngRoute',
  'pdCommon'
])
  .config(function (authRouteProvider) {
    var routeConfig = {
      'oms': {
        url: '/oms',
        template: '<ui-view/>'
      },
      'oms.placesmap': {
        url: '/placesmap',
        controller: 'OmsPlacesMapCtrl',
        templateUrl: 'views/modules/oms/placesmap/main.html',
        title: 'Инвентаризация',
        pageClass: 'oms-placesmap'
      },
      'oms.placesPhotos': {
        url: '/places-photos',
        controller: 'OmsPlacesPhotosCtrl',
        templateUrl: 'views/modules/oms/places_photos/main.html',
        title: 'Ввод архива по фото',
        pageClass: 'oms-places-photos'
      },
      'oms.orgplaces': {
        url: '/orgplaces',
        controller: 'pdCommonOrgPlacesCtrl',
        templateUrl: 'views/modules/common/orgplaces/main.html',
        title: 'Подразделения'
      }
    };

    _.forEach(routeConfig, function (stateParams, stateName) {
      authRouteProvider
        .state(stateName, _.merge({
          secured: true,
          menuConfig: 'omsMenu'
        }, stateParams || {}), 'ROLE_OMS')
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
              {link: '#!/oms/placesmap', title: 'Карта захоронений'},
              {link: '#!/oms/places-photos', title: 'Ввод архива по фото'},
              {link: '/oms/orgplaces', title: 'Подразделения'},
              {link: serverConfig.serverHost + 'loruregistry', title: 'Реестр ЛОРУ'},
              {
                link: serverConfig.serverHost + 'org/' + userOrgId + '/edit',
                title: 'Организация',
                hide: !userOrgId
              },
              {link: serverConfig.serverHost + 'userprofile', title: 'Пользователь'},
              {link: serverConfig.serverHost + 'org/log', title: 'Журнал'},
              {class: 'divider'},
              {link: '#!/signout', title: 'Выйти'}
            ]
          }
        ]);
      };

    omsMenuConfig.setMainMenuItems(pdConfig.menuConfigs.omsMenu.items);
    omsMenuConfig.setMenuClass(pdConfig.menuConfigs.omsMenu.navbarClasses);
    $rootScope.$on('$stateChangeSuccess', setupMenu);
    $rootScope.$on('auth.signin_success', setupMenu);
  })
;
