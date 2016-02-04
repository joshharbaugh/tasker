angular.module('myVillages.tasker.app.userTaskPermissions')
    .factory('userTaskPermissionsDataService', ['API_BASE_URL', '$http', '$q',
        function (API_BASE_URL, $http, $q) {
        	'use strict';

        	var getPermissions = function (searchArgs) {
        		var deferred = $q.defer();
        		$http.get(API_BASE_URL + 'usertask/permissions', { params: searchArgs }).then(function (result) {
        			deferred.resolve(result.data);
        		}, function (result) {
        			toastr.error(result.statusText);
        			deferred.reject(result.data);
        		});
        		return deferred.promise;
        	};

        	var getSuggestedServiceProviders = function (keyword) {
        		var deferred = $q.defer();
        		$http.get(API_BASE_URL + 'usertask/serviceproviders?searchKeyword=' + keyword, {}).then(function (result) {
        			deferred.resolve(result.data);
        		}, function (result) {
        			toastr.error(result.statusText);
        			deferred.reject(result.data);
        		});
        		return deferred.promise;
        	};

        	var updatePermissions = function (userTaskPermissionsArgs) {
        		var deferred = $q.defer();
        		var httpMethod = 'POST';
        		$http({ method: httpMethod, url: API_BASE_URL + 'usertask/permissions', data: userTaskPermissionsArgs }).then(function (result) {
        			deferred.resolve(result.data);
        		}, function (result) {
        			toastr.error(result.statusText);
        			deferred.reject(result.statusText);
        		});
        		return deferred.promise;
        	};

        	return {
        		getPermissions: getPermissions,
        		getSuggestedServiceProviders: getSuggestedServiceProviders,
        		updatePermissions: updatePermissions
        	};
        }
    ]);
