'use strict';

angular.module('pdCommon')
  .service('objectsDiff', function () {
    var diffFunc = function (initial, override) {
      var diffObj = {};

      for (var name in initial) {
        if (initial.hasOwnProperty(name) && override.hasOwnProperty(name)) {
          if (_.isObject(override[name]) && !_.isArray(override[name])) {
            var diff = diffFunc(initial[name], override[name]);

            if (!_.isEmpty(diff)) {
              diffObj[name] = diff;
            }
          } else if (!_.isEqual(initial[name], override[name])) {
            diffObj[name] = override[name];
          }
        }
      }

      return diffObj;
    };

    return diffFunc;
  })
;
