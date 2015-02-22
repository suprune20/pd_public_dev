'use strict';

angular.module('pdCommon')
  .directive('touchspin', function () {
    return {
      template: '<input type="text" name="spin" class="form-control spinner-input">',
      require: 'ngModel',
      restrict: 'E',
      link: function (scope, element, attrs, ngModelCtrl) {
        var min = parseInt(attrs.min || 0, 10),
          max = parseInt(attrs.max || 999),
          step = parseInt(attrs.step || 1),
          touchspinInput;

        touchspinInput = element.find('input').TouchSpin({
          min: min,
          max: max,
          stepinterval: step,
          initval: ngModelCtrl.$modelValue,
          forcestepdivisibility : 'none',
          booster : false
        });
        touchspinInput.on('change', function () {
          ngModelCtrl.$setViewValue(parseInt(touchspinInput.val(), 10));
        });
      }
    };
  })
;
