'use strict';

angular.module('pdConfig', [])
  .factory('pdConfig', function (serverConfig, $window, appEnv) {
    // Dynamic change server host for generate .ru and .by domains for backend urls (only staging and prod envs)
    if (_.contains(['staging', 'prod'], appEnv)) {
      serverConfig.serverHost = $window.location.origin + '/';

      var hostParts = $window.location.host.split('.');
      serverConfig.cookieDomain = '.' + hostParts[hostParts.length - 2] + '.' + hostParts[hostParts.length - 1];
    }

    return {
      apiEndpoint: serverConfig.serverHost + 'api/',
      backendUrl: serverConfig.serverHost,
      AUTH_TOKEN_KEY: 'pd.auth.token',
      AUTH_ROLES_KEY: 'pd.auth.roles',
      AUTH_PROFILE_KEY: 'pd.auth.user.profile',
      AUTH_COOKIE_DOMAIN: serverConfig.cookieDomain,
      recaptchaPubKey: '6Lei0O0SAAAAAOdE7TBoo_swYvho9uGz7hadCL0O',
      imageThumbnailerConfig: {
        baseUrl: serverConfig.serverHost + 'media',
        thumbnailBaseUrl: serverConfig.serverHost + 'thumb'
      },
      menuConfigs: {
        cabinetMenu: {
          items:[
            {link: '#/client-panel', title: 'Кабинет ответственного'},
            {link: '#/catalog', title: 'Каталог'}
          ]
        },
        adminMenu: {
          navbarClasses: 'navbar-inverse',
          items: [
            {link: serverConfig.serverHost, title: 'Django панель'}
          ]
        },
        loruMenu: {
          navbarClasses: 'navbar-inverse',
          items: [
            {link: serverConfig.serverHost, title: 'Открытые'},
            {link: serverConfig.serverHost + 'burials/search/', title: 'Захоронения'},
            {link: serverConfig.serverHost + 'burials/create/', title: 'Создать захоронение'},
            {link: serverConfig.serverHost + 'order/', title: 'Заказы'},
            {link: serverConfig.serverHost + 'order/create/', title: 'Создать заказ'}
          ]
        }
      }
    };
  })
;
