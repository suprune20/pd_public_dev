'use strict';

angular.module('pdCommon')
  .service('mainMenuManager', function () {
    var hidden = false,
      menuItems,
      menuBlockClasses,
      menuConfigs = [],
      hideMenu = function (isHidden) {
        hidden = !!isHidden;
      },
      isHiddenMenu = function () {
        return hidden;
      },
      setMenuItems = function (_menuItems_) {
        menuItems = _menuItems_;
      },
      getMenuItems = function () {
        return menuItems;
      },
      setClasses = function (classes) {
        menuBlockClasses = classes;
      },
      getClasses = function () {
        return menuBlockClasses;
      },
      addMenuConfig = function (configName, menuConfig) {
        menuConfigs[configName] = menuConfig;
      },
      setCurrentMenuConfig = function (configName) {
        if (!menuConfigs[configName]) {
          return;
        }

        var menuConfig = menuConfigs[configName];
        menuItems = menuConfig.items;
        menuBlockClasses = menuConfig.navbarClasses ? menuConfig.navbarClasses : [];
      };

    return {
      hide: hideMenu,
      isHidden: isHiddenMenu,
      setMenuItems: setMenuItems,
      getMenuItems: getMenuItems,
      setClasses: setClasses,
      getClasses: getClasses,
      addMenuConfig: addMenuConfig,
      setCurrentMenuConfig: setCurrentMenuConfig
    };
  })
;
