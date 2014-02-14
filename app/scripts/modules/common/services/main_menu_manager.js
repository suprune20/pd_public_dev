'use strict';

angular.module('pdCommon')
  .service('mainMenuManager', function () {
    var MenuConfig = function () {
      var mainMenuItems,
        rightMenuItems,
        menuClass;

      return {
        setMenuClass: function (_menuClass_) {
          menuClass = _menuClass_;
        },
        getMenuClasses: function () {
          return menuClass;
        },
        setMainMenuItems: function (items) {
          mainMenuItems = items;
        },
        getMainMenuItems: function () {
          return mainMenuItems;
        },
        setRightMenuItems: function (items) {
          rightMenuItems = items;
        },
        getRightMenuItems: function () {
          return rightMenuItems;
        }
      };
    };

    var hidden = false,
      menuConfigs = [],
      currentMenuConfig,
      hideMenu = function (isHidden) {
        hidden = !!isHidden;
      },
      isHiddenMenu = function () {
        return hidden;
      },
      getMenuItems = function () {
        return currentMenuConfig ? currentMenuConfig.getMainMenuItems() : '';
      },
      getRightMenuItems = function () {
        return currentMenuConfig ? currentMenuConfig.getRightMenuItems() : '';
      },
      getClasses = function () {
        return currentMenuConfig ? currentMenuConfig.getMenuClasses() : '';
      },
      addMenuConfig = function (configName) {
        if (_.has(menuConfigs, configName)) {
          return menuConfigs[configName];
        }

        menuConfigs[configName] = new MenuConfig();
        return menuConfigs[configName];
      },
      setCurrentMenuConfig = function (configName) {
        if (!menuConfigs[configName]) {
          return;
        }

        currentMenuConfig = menuConfigs[configName];
      };

    return {
      hide: hideMenu,
      isHidden: isHiddenMenu,
      getMenuItems: getMenuItems,
      getRightMenuItems: getRightMenuItems,
      getClasses: getClasses,
      addMenuConfig: addMenuConfig,
      setCurrentMenuConfig: setCurrentMenuConfig
    };
  })
;
