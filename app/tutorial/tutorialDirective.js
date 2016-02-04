angular.module('myVillages.tasker.app.tutorial')
    .directive('tkTutorialOverlay', ['$window', '$timeout', '$kookies', function ($window, $timeout, $kookies) {
        return {
            restrict: 'E',
            templateUrl: '/Scripts/tasker/app/tutorial/tutorialOverlay.html',
            link: function (scope, elem) {
                var height = document.documentElement.offsetHeight,
                    overlayContainer = elem.find('#tutorial-overlay');

                // adjust overlay height
                angular.element(overlayContainer).css({ height: height + 'px' });

                $window.onscroll = function () {
                    var height = document.documentElement.offsetHeight,
                        overlayContainer = elem.find('#tutorial-overlay');

                    // adjust overlay height
                    angular.element(overlayContainer).css({ height: height + 'px' });
                };

                scope.isOverlayHidden = true;
                scope.toggle = function () {
                    window.jQuery('document').joyride('end');
                    elem.find('div').toggle();
                    scope.isOverlayHidden = !scope.isOverlayHidden;
                    scope.$parent.$broadcast('event:toggleTutorialHotSpots', {isOverlayHidden: scope.isOverlayHidden});
                    $kookies.set('isOverlayHidden', scope.isOverlayHidden); // session cookie (cleared when browser session closed)
                    $kookies.set('hasSeenTutorialOverview', true, { expires: 365 }); // 365 day expiration (1 year)
                };

                if (!$kookies.get('hasSeenTutorialOverview')) {
                    scope.toggle();
                }

                window.jQuery('body').on('tourEnded', function () {
                    $timeout(function () {
                        overlayContainer.hide();
                        scope.isOverlayHidden = !scope.isOverlayHidden;
                    });
                });
            }
        };
    }])

    .directive('tourWidget', ['$timeout', '$kookies', function ($timeout, $kookies) {
        return {
            restrict: 'A',
            replace: false,
            scope: true,
            link: function (scope, elem, attrs) {
                var $elem = angular.element(elem),
                    isTourDisabled = $kookies.get('hasSeenTutorialOverview'),
                    isOverlayHidden = $kookies.get('isOverlayHidden'),
                    authInfo = JSON.parse($kookies.get('authInfo'));
                scope.userCategory = authInfo.userCategory;
                
                var baseOpts = {
                    'cookieMonster': true,
                    'cookieName': 'hasSeenTutorialOverview',
                    'template': {
                        'link': '',
                        'button': '<a href="#" class="joyride-next-tip btn btn-info"></a>'
                    },
                    'preStepCallback': function () {
                        if (!scope.$$phase) {
                            scope.$apply(function () {
                                if (isTourDisabled) {
                                    window.jQuery('document').joyride('end');
                                }
                            });
                        }
                    }
                },
                customOpts = scope.$eval(attrs.tourWidget),
                options = angular.extend(baseOpts, customOpts);

                scope.$parent.$on('event:toggleTutorialHotSpots', function (event, args) {
                    $timeout(function () {
                        if (!args.isOverlayHidden) {
                            window.jQuery('#' + $elem[0].id).joyride(options);
                        }
                        else {
                            window.jQuery('document').joyride('end');
                        }
                    }, 600);
                });

                window.jQuery('body').on('tourEnded', function () {
                    $timeout(function () {
                        window.jQuery('document').joyride('end');
                    });
                });

            }
        };

    }]);