angular.module('myVillages.tasker.app.userTaskTags', [])
    .factory('userTaskTagsDataService', ['API_BASE_URL', '$http', '$q',
        function (API_BASE_URL, $http, $q) {
        	'use strict';

        	var userTaskTagsSearch = function (userTaskId) {
        		var deferred = $q.defer();
        		$http.get(API_BASE_URL + 'usertasktags?userTaskId=' + userTaskId).then(function (result) {
        			deferred.resolve(result.data);
        		}, function (result) {
        			toastr.error(result.statusText);
        			deferred.reject(result.data);
        		});
        		return deferred.promise;
        	};

        	var userTaskTagPersist = function (userTaskTag) {
        		var deferred = $q.defer();
        		var httpMethod = userTaskTag.RowId ? 'PUT' : 'POST';
        		$http({ method: httpMethod, url: API_BASE_URL + 'usertask/tag', data: userTaskTag }).then(function (result) {
        			deferred.resolve(result.data);
        		}, function (result) {
        			toastr.error(result.statusText);
        			deferred.reject(result.statusText);
        		});
        		return deferred.promise;
        	};

        	var userTaskTagDelete = function (userTaskTagId) {
        		var deferred = $q.defer();
        		$http.delete(API_BASE_URL + 'usertask/tag?userTaskTagId=' + userTaskTagId).then(function (result) {
        			deferred.resolve(result.data);
        		}, function (result) {
        			deferred.reject(result.data);
        		});
        		return deferred.promise;
        	};

        	return {
        		userTaskTagsSearch: userTaskTagsSearch,
        		userTaskTagPersist: userTaskTagPersist,
        		userTaskTagDelete: userTaskTagDelete
        	};
        }
    ]);