'use strict';

angular.module('myVillages.tasker.app.heartbeat.directives')
    .directive('techStatusUpdates', ['$http', 'API_BASE_URL', 'heartBeatInterval', '$sce','$rootScope', function ($http, API_BASE_URL, heartBeatInterval, $sce, $rootScope) {
        return {
            restrict: 'A'
            , requires: '^datetimeFilters'
            , replace: true
            , scope: {
                vm: '=ngModel'
                , user: '=userData'
            }
            , templateUrl: '/Scripts/tasker/app/heartbeat/techStatusUpdates.html'
            , link: function (scope, elem, attrs) {
                var interval, pulse, searchArgs = {}, initialLoad = true

                function initialize(USER_DATA) {
                    interval = heartBeatInterval[scope.vm.applied_datetime]
                    searchArgs = {
                        AssignedUserId: USER_DATA['RowId'],
                        HeartBeatInterval: interval
                    }

                    fetch(searchArgs)
                }

                function fetch(args) {
                    if (args['HeartBeatInterval']) {
                        scope.isLoading = true
                        $http.get(API_BASE_URL + 'heartbeat/servicetech', { params: args, ignoreLoadingBar: true })
                            .then(function (result) {
                                scope.vm.updates = result.data
                                scope.isLoading = false
                                initialLoad = false
                                $rootScope.$broadcast('event:heartbeat')
                                if ($rootScope.refreshRate !== 'null') setPulse(args)
                            }, function (result) {
                                scope.isLoading = false
                                initialLoad = false
                                if ($rootScope.refreshRate !== 'null') setPulse(args)
                                if (result.statusText)
                                    toastr.error(result.statusText)
                                else
                                    toastr.error("An unexpected error has occurred. Please try again.")
                            })                   
                    }
                }

                function setPulse(args) {
                    clearInterval(pulse)
                    pulse = setInterval(function () {
                        scope.isLoading = true
                        $http.get(API_BASE_URL + 'heartbeat/servicetech', { params: args, ignoreLoadingBar: true })
                            .then(function (result) {
                                scope.vm.updates = result.data
                                scope.isLoading = false
                            }, function (result) {
                                scope.isLoading = false
                                if (result.statusText)
                                    toastr.error(result.statusText)
                                else
                                    toastr.error("An unexpected error has occurred. Please try again.")
                            })
                    }, parseInt($rootScope.refreshRate))
                }

                scope.$watch('user', function (USER_DATA) {
                    if (USER_DATA) initialize(USER_DATA)
                })

                // work in progress...
                scope.$watch('user.clients', function (userClients) {
                    if (userClients) {
                        _.each(userClients, function (client) {
                            // TODO possibly attach tasks to clients for better filtering of tech status updates?
                        })
                    }
                })

                scope.$watch('vm.applied_datetime', function (datetime) {
                    if (datetime) {
                        interval = heartBeatInterval[datetime]
                        searchArgs['HeartBeatInterval'] = interval
                        if (scope.user && searchArgs['AssignedUserId']) fetch(searchArgs)
                    }
                })

                scope.$watch('vm.selected_client', function (client) {
                    if (client) {
                        var $parsed = JSON.parse(client)

                        if ($parsed['ToyName']) {
                            searchArgs = {
                                AssignedUserId: scope.user['RowId'],
                                ToyRowId: $parsed['RowId'],
                                HeartBeatInterval: interval
                            }
                        } else {
                            searchArgs = {
                                AssignedUserId: scope.user['RowId'],
                                TaskUserRowId: $parsed['RowId'],
                                HeartBeatInterval: interval
                            }
                        }

                        fetch(searchArgs)
                    }
                })

                $rootScope.$on('event:heartbeatDisabled', function (event, args) {
                    clearInterval(pulse)
                })

                scope.renderHtml = function (html_code) {
                    var result = $sce.trustAsHtml(html_code);
                    return result;
                };
            }
        }
    }])