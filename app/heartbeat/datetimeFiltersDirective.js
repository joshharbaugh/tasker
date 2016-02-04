'use strict';

angular.module('myVillages.tasker.app.heartbeat.directives')
    .directive('datetimeFilters', ['heartBeatInterval', '$timeout', function (heartBeatInterval, $timeout) {
        return {
            restrict: 'A'
            , replace: true
            , scope: {
                vm: '=ngModel'
            }
            , templateUrl: '/Scripts/tasker/app/heartbeat/datetimeFilters.html'
            , link: function (scope, elem, attrs) {
                if(!scope.vm) scope.vm = 'MostRecent'

                scope.applyDatetimeFilter = function (filter) {
                    $timeout(function() {
                        scope.vm = filter
                    })
                }
            }
        }
    }])