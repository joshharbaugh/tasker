'use strict';
angular.module('myVillages.tasker.app.common.directives')
    .directive('sticky', ['$rootScope', 'debounce', '$window', '$interval', function ($rootScope, debounce, $window, $interval) {
        return {
            restrict: 'AC'
            , link: function (scope, el, attrs) {
                var cfg = scope.$eval(attrs['sticky']) || {}
                    , pageYOffset = $window.pageYOffset
                    , clientHeight
                    , footerHeight
                    , elementHeight = el.outerHeight()
                    , bottomThreshold
                    , bottomOfElementPosition
                    , calculate
                    ;

                function affix(position) {
                    switch (position) {
                        case 'top':
                            el.css('position', 'relative')
                            el.css('top', '0px')
                            el.css('bottom', 'auto')
                            break;
                        case 'middle':
                            el.css('position', 'fixed')
                            el.css('top', '0px')
                            el.css('bottom', 'auto')
                            el.css('width', '32.5%')
                            break;
                        case 'bottom':
                            el.css('position', 'absolute')
                            el.css('top', 'auto')
                            el.css('bottom', footerHeight + 'px')
                            el.css('width', '32.5%')
                            break;
                    }
                }

                function setPosition() {
                    pageYOffset = $window.pageYOffset
                    elementHeight = el.outerHeight()
                    bottomOfElementPosition = (pageYOffset + elementHeight)
                    bottomThreshold = (clientHeight + (cfg.offsetTop || jQuery('.navbar').height()))

                    if (pageYOffset < (cfg.offsetTop || jQuery('.navbar').height())) {
                        affix('top')
                    }
                    else if (pageYOffset >= (cfg.offsetTop || jQuery('.navbar').height()) && bottomOfElementPosition < bottomThreshold) {
                        affix('middle')
                    }
                    else if (pageYOffset >= (cfg.offsetTop || jQuery('.navbar').height()) && bottomOfElementPosition >= bottomThreshold) {
                        affix('bottom')
                    }
                }

                // only need to worry about non-'mobile' devices (desktop, iPads, tablets)
                if (!window.isMobile()) {
                    $interval(function () {
                        if (clientHeight !== jQuery('.workspace').outerHeight()) {
                            clientHeight = jQuery('.workspace').outerHeight()
                            debounce(setPosition(), 0)
                        }
                        if ($window.pageYOffset !== pageYOffset) {
                            debounce(setPosition(), 0)
                        }
                    }, 10)

                    $rootScope.$watch('workspace', function (workspace) {
                        if (workspace && workspace.dimensions) {
                            clientHeight = workspace.dimensions.clientHeight
                        }
                        if (workspace && workspace.footerHeight) {
                            footerHeight = workspace.footerHeight
                        }
                    }, true)
                }
            }
        }
    }]);
