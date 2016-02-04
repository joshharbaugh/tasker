angular.module('myVillages.tasker.app.userTaskServiceTech')
    .factory('userTaskServiceTechDataService', ['API_BASE_URL', '$http', '$q',
        function (API_BASE_URL, $http, $q) {
            'use strict';

            var getAll = function (searchArgs) {
                var deferred = $q.defer();
                $http.get(API_BASE_URL + 'usertask/servicetechs', { params: searchArgs }).then(function (result) {
                    deferred.resolve(result.data);
                }, function (result) {
                    toastr.error(result.statusText);
                    deferred.reject(result.data);
                });
                return deferred.promise;
            };

            return {
                getAll: getAll
            };
        }
    ]);