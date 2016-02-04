angular.module('myVillages.tasker.app.common.directives').
    directive('tkBackgroundImage', [function () {
        return function (scope, element, attrs) {
            attrs.$observe('tkBackgroundImage', function (value) {
                element.css({
                    'background-image': 'url(' + value + ')'//,
                    //'background-size': 'cover'
                });
                console.log('  tkBackgroundImage-->' + value);
            });
        };
    }]).

    directive('tkHeightChange', [function () {
        return {
            link: function (scope, elem, attrs) {
                var height;
                scope.$watch(function () {
                    if (height !== elem.height()) {
                        height = elem.height();
                        scope.$broadcast('event:containerHeightChange', { height: height });
                    }
                });
            }
        }
    }]);