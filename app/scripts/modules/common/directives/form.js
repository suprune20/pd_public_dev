'use strict';

angular.module('pdCommon')
  .directive('fixAutofill', function ($interval) {
    return function (scope, iElement, iAttrs) {
      var intervalPromise;

      iAttrs.$observe('fixAutofill', function (needFix) {
        if (true === scope.$eval(needFix)) {
          intervalPromise = $interval(function () {
            iElement.find('input, textarea, select')
              .trigger('input')
              .trigger('change')
              .trigger('keydown');
          }, 500);
        } else if (intervalPromise) {
          // Clear intervals between needFix callbacks callbacks
          $interval.cancel(intervalPromise);
        }
      });
      scope.$on('$destroy', function () {
        $interval.cancel(intervalPromise);
      });
    };
  })
  .directive('pdFileSelector', function (fileReader) {
    return {
      restrict: 'E',
      require: 'ngModel',
      templateUrl: 'views/modules/common/directives/pd_file_selector.html',
      scope: {
        pdMaxWidth: '@',
        pdMaxHeight: '@',
        accept: '@'
      },
      link: function (scope, element, attrs, ngModel) {
        if (!ngModel) {
          return;
        }

        var updateModelViewValue = function (value) {
          ngModel.$setViewValue(value);
          ngModel.$render();
        };

        ngModel.$render = function () {
          var modelValue = ngModel.$viewValue;

          scope.isEmptyModel = !modelValue;

          if (_.has(attrs, 'pdAllowPreview')) {
            var addPreviewImage = function (imageSrc) {
                scope.imageSourceData = imageSrc;
              },
              clearPreview = function () {
                delete scope.imageSourceData;
              }
            ;

            if (modelValue instanceof File && /image\//.test(modelValue.type)) {
              fileReader.readAsDataURL(modelValue, scope)
                .then(function (imageData) {
                  addPreviewImage(imageData);
                });
            } else if (/https?:\/\//.test(modelValue)) {
              addPreviewImage(modelValue);
            } else {
              clearPreview();
            }
          }
        };

        element.find('[type=file]').on('change', function (event) {
          scope.$apply(function () {
            if (!event.target.files.length) {
              return;
            }

            updateModelViewValue(event.target.files[0]);
          });
        });

        scope.clearSelection = function () {
          updateModelViewValue(null);
        };

        scope.isSimpleView = _.has(attrs, 'simpleView');
      }
    };
  })
  .directive('passwordRepeat', function () {
    return {
      require: 'ngModel',
      link: function (scope, iElement, iAttrs, modelCtrl) {
        var otherInput = iElement.inheritedData('$formController')[iAttrs.passwordRepeat];

        scope.$watch(function () {
          return otherInput.$modelValue;
        }, function (newValue) {
          if (modelCtrl && modelCtrl.$modelValue) {
            if (newValue === modelCtrl.$modelValue) {
              modelCtrl.$setValidity('passwordRepeat', true);
            } else {
              modelCtrl.$setValidity('passwordRepeat', false);
            }
          }
        });

        modelCtrl.$parsers.push(function(viewValue) {
          if (viewValue) {
            if (viewValue === otherInput.$modelValue) {
              modelCtrl.$setValidity('passwordRepeat', true);
              return viewValue;
            } else {
              modelCtrl.$setValidity('passwordRepeat', false);
              return undefined;
            }
          } else {
            modelCtrl.$setValidity('passwordRepeat', true);
            return viewValue;
          }
        });
      }
    };
  })
;
