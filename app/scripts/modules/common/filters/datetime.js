'use strict';

angular.module('pdCommon')
  .filter('momentDate', function () {
    return function (value, format) {
      var momentDate = moment(value);
      if (!momentDate.isValid()) {
        return null;
      }

      return momentDate.format(format);
    };
  })
;
