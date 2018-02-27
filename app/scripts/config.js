'use strict';

angular.module('pdConfig', [])
  .service('pdConfig', function (serverConfig, $window, appEnv) {
    // Dynamic change server host for generate .ru and .by domains for backend urls (only staging and prod envs)
    // frontend: pohoronnoedelo.by -> backend urls: org.pohoronnoedelo.by
    if (_.contains(['staging', 'prod'], appEnv)) {
      serverConfig.serverHost = $window.location.protocol + '//org.' + $window.location.host + '/';

      var hostParts = $window.location.host.split('.');
      var cookieDomainChunks = serverConfig.cookieDomain.split('.');
      cookieDomainChunks[cookieDomainChunks.length - 1] = hostParts[hostParts.length - 1];
      serverConfig.cookieDomain = cookieDomainChunks.join('.');
    }

    return {
      apiEndpoint: serverConfig.serverHost + 'api/',
      backendUrl: serverConfig.serverHost,
      AUTH_TOKEN_KEY: 'pd.auth.token',
      AUTH_ROLES_KEY: 'pd.auth.roles',
      AUTH_PROFILE_KEY: 'pd.auth.user.profile',
      AUTH_COOKIE_DOMAIN: serverConfig.cookieDomain,
      recaptchaPubKey: '6LcWyUMUAAAAAJDy-m10SHvp4nWhbkLMn4qPtei',
      imageThumbnailerConfig: {
        baseUrl: serverConfig.serverHost + 'media',
        thumbnailBaseUrl: serverConfig.serverHost + 'thumb'
      },
      roles: {
        oms: 'ROLE_OMS'
      },
      menuConfigs: {
        emptyMenu: { items: [] },
        cabinetMenu: {
          items:[
            {link: '/client-panel', title: 'Места захоронений'},
            {link: '/', title: 'Каталог ритуальных товаров и услуг'},
            {link: '/client/orders', title: 'История заказов'}
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
        },
        omsMenu: {
          navbarClasses: 'navbar-inverse',
          items: [
            {link: serverConfig.serverHost, title: 'Открытые'},
            {link: serverConfig.serverHost + 'burials/', title: 'Захоронения'},
            {link: serverConfig.serverHost + 'burials/create/', title: 'Создать захоронение'},
            {link: serverConfig.serverHost + 'burials/create/?archive=1', title: 'Внести архивное'}
          ]
        }
      },
      oauthProviders: {
        facebook: 'Facebook',
        google: 'Google',
        yandex: 'Yandex',
        vk: 'Vkontakte',
        odnoklassniki: 'Odnoklassniki'
      },
      paymentServers: {
        webpay: {
          test: 'https://secure.sandbox.webpay.by:8843/',
          prod: 'https://secure.webpay.by/'
        }
      }
    };
  })
;
