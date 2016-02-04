'use strict';
angular.module('myVillages.tasker.app.common.services')
    .factory('debounce', ['$q', '$timeout', function ($q, $timeout) {
        return function (func, wait, immediate) {
            var timeout
                , deferred = $q.defer()
                ;
            return function () {
                var context = this
                    , args = arguments
                    ;
                var later = function () {
                    timeout = null;
                    if (!immediate) {
                        deferred.resolve(func.apply(context, args));
                        deferred = $q.defer();
                    }
                };
                var callNow = immediate && !timeout;
                if (timeout) {
                    $timeout.cancel(timeout)
                }
                timeout = $timeout(later, wait)
                if (callNow) {
                    deferred.resolve(func.apply(context, args))
                    deferred = $q.defer()
                }
                return deferred.promise
            }
        }
    }]);
