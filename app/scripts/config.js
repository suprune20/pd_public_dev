'use strict';

angular.module('pdConfig', [])
  .factory('pdConfig', function (serverConfig) {
    return {
      apiEndpoint: serverConfig.serverHost + 'api/',
      backendUrl: serverConfig.serverHost,
      AUTH_TOKEN_KEY: 'pd.auth.token',
      AUTH_ROLES_KEY: 'pd.auth.roles',
      AUTH_COOKIE_DOMAIN: serverConfig.cookieDomain,
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
            {link: serverConfig.serverHost, title: 'Django панель'},
            {link: '#/loru/advertisement', title: 'Реклама'}
          ]
        }
      }
    };
  })
;
