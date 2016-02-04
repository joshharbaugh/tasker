'use strict';
angular.module('myVillages.tasker.app.common.directives').
    directive('workspace', ['$log', '$timeout', '$rootScope', '$window', 'debounce', function ($log, $timeout, $rootScope, $window, debounce) {
        return {
            scope: '&'
            , restrict: 'AC'
            , link: function (scope, el, attrs) {
                function publishWorkspaceDimensions(elm) {
                    $rootScope.workspace = $rootScope.workspace || {};
                    var dim = $rootScope.workspace.dimensions = $rootScope.workspace.dimensions || {};
                    var atts = ['offsetWidth', 'offsetHeight', 'clientWidth', 'clientHeight', 'scrollWidth', 'scrollHeight']
                    atts.forEach(function (att) {
                        dim[att] = elm[att]
                    })
                    $rootScope.workspace.footerHeight = getFooterHeight()
                    //$log.debug($rootScope.workspace)
                }

                function resize(e) {
                    publishWorkspaceDimensions(el[0])
                }

                function getFooterHeight() {
                    return jQuery('footer > #footer').outerHeight()
                }

                var lazyResize = debounce(resize, 10)

                $window.removeEventListener('resize', lazyResize)
                $window.addEventListener('resize', lazyResize)
                $window.removeEventListener('scroll', lazyResize)
                $window.addEventListener('scroll', lazyResize)

                scope.$on('$destroy', function () {
                    $window.removeEventListener('resize', lazyResize)
                    $window.removeEventListener('scroll', lazyResize)
                })

                lazyResize()
            }
        }
    }]);
