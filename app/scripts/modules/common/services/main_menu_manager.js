'use strict';

angular.module('pdCommon')
  .service('mainMenuManager', function () {
    var hidden = false,
      menuItems,
      menuBlockClasses,
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
      };

    return {
      hide: hideMenu,
      isHidden: isHiddenMenu,
      setMenuItems: setMenuItems,
      getMenuItems: getMenuItems,
      setClasses: setClasses,
      getClasses: getClasses
    };
  })
;
