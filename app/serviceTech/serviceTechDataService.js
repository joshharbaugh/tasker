angular.module('myVillages.tasker.app.serviceTech')
    .factory('serviceTechDataService', ['API_BASE_URL', '$http', '$q', 'authService',
        function (API_BASE_URL, $http, $q, authService) {
            'use strict';

            var getAll = function (searchArgs) {
                var deferred = $q.defer();
                $http.get(API_BASE_URL + 'business/admin/users/search', { params: searchArgs }).then(function (result) {
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