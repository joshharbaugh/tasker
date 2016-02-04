angular.module('myVillages.tasker.app.userTaskMessages')
    .factory('userTaskMessagesDataService', ['API_BASE_URL', '$http', '$q',
        function (API_BASE_URL, $http, $q) {
            'use strict';

            var getAll = function (searchArgs) {
                var deferred = $q.defer();
                $http.get(API_BASE_URL + 'usertask/messages', { params : searchArgs }).then(function (result) {
                    deferred.resolve(result.data);
                }, function (result) {
                    toastr.error(result.statusText);
                    deferred.reject(result.data);
                });
                return deferred.promise;
            };

            var save = function (userTaskMessage) {
                var deferred = $q.defer();
                var httpMethod = 'POST';
                $http({ method: httpMethod, url: API_BASE_URL + 'usertask/message', data: userTaskMessage }).then(function (result) {
                    deferred.resolve(result.data);
                }, function (result) {
                    toastr.error(result.statusText);
                    deferred.reject(result.statusText);
                });
                return deferred.promise;
            };

            return {
                getAll: getAll,
                save: save
            };
        }
    ]);