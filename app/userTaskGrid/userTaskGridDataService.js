angular.module('myVillages.tasker.app.userTaskGrid')
    .factory('userTaskGridDataService', ['API_BASE_URL', '$http', '$q', 'authService', '$window',
        function (API_BASE_URL, $http, $q, authService, $window) {
            'use strict';

            var getAllForGrid = function (searchArgs) {
                var deferred = $q.defer();
                $http.get(API_BASE_URL + 'usertaskandgroup/search', { params: searchArgs }).then(function (result) {
                    deferred.resolve(result.data);
                }, function (result) {
                    toastr.error(result.statusText);
                    deferred.reject(result.data);
                });
                return deferred.promise;
            };

            var getAllTasksForTechGrid = function (searchArgs) {
                var deferred = $q.defer();
                $http.get(API_BASE_URL + 'usertaskandgroup/tech', { params: searchArgs }).then(function (result) {
                    deferred.resolve(result.data);
                }, function (result) {
                    toastr.error(result.statusText);
                    deferred.reject(result.data);
                });
                return deferred.promise;
            };

            var userTaskAndGroupIndexUpdate = function (userTaskAndGroupIndexes) {
                var deferred = $q.defer();
                $http({ method: 'POST', url: API_BASE_URL + 'usertask/taskandgroupindexes', data: userTaskAndGroupIndexes }).then(function (result) {
                    deferred.resolve(result.data);
                }, function (result) {
                    toastr.error(result.statusText);
                    deferred.reject(result.statusText);
                });
                return deferred.promise;
            };

            return {
                getAllForGrid: getAllForGrid,
                getAllTasksForTechGrid: getAllTasksForTechGrid,
                userTaskAndGroupIndexUpdate: userTaskAndGroupIndexUpdate
            };
        }
    ]);