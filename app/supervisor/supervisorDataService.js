angular.module('myVillages.tasker.app.supervisor')
    .factory('supervisorDataService', ['API_BASE_URL', '$http', '$q',
        function (API_BASE_URL, $http, $q) {
            'use strict';

            var getSupervisors = function (businessRowId) {
                var deferred = $q.defer();
                $http.get(API_BASE_URL + 'business/supervisors', { params: { BusinessRowId: businessRowId } }).then(function (result) {
                    deferred.resolve(result.data);
                }, function (result) {
                    toastr.error(result.statusText);
                    deferred.reject(result.data);
                });
                return deferred.promise;
            };

            var getSubcontractors = function (userId) {
            	var deferred = $q.defer();
            	$http.get(API_BASE_URL + 'usertask/subcontractorslist?userId=' + userId).then(function (result) {
            		deferred.resolve(result.data);
            	}, function (result) {
            		toastr.error(result.statusText);
            		deferred.reject(result.data);
            	});
            	return deferred.promise;
            };

            return {
            	getSupervisors: getSupervisors,
            	getSubcontractors: getSubcontractors,
            };
        }
    ]);
