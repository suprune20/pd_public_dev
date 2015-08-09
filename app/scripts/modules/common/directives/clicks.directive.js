'use strict';

angular.module('pdCommon')
  .directive('outsideClick', function ($document) {
    return {
      link: function (scope, element, attrs) {
        var scopeExpression = attrs.outsideClick,
          onDocumentClick = function (event) {
            // if not current or child elements
            if (!(element.find(event.target).length > 0 || angular.equals(angular.element(event.target), element))) {
              scope.$apply(scopeExpression);
            }
          };

        $document.on('click', onDocumentClick);
        element.on('$destroy', function() {
          $document.off('click', onDocumentClick);
        });
      }
    };
  })
;
