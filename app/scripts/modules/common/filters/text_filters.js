'use strict';

angular.module('pdCommon')
  .filter('space2br', function () {
    return function (value) {
      if (value) {
        value = value.replace(/\s/g, '<br/>');
      }

      return value;
    };
  })
  .filter('substring', function () {
    return function (value, substringStart, substringEnd) {
      return value.substring(substringStart, substringEnd);
    };
  })
;
