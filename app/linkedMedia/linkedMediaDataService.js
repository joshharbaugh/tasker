angular.module('myVillages.tasker.app.linkedMedia')
    .factory('linkedMediaDataService', ['API_BASE_URL', '$http', '$q',
        function (API_BASE_URL, $http, $q) {
        	'use strict';

        	var getTaskLinkedMedia = function (searchArgs) {
        		var deferred = $q.defer();
        		$http.get(API_BASE_URL + 'media/search', { params: searchArgs }).then(function (result) {
        			deferred.resolve(result.data);
        		}, function (result) {
        			toastr.error(result.statusText);
        			deferred.reject(result.data);
        		});
        		return deferred.promise;
        	};

        	var getLinkedMedia = function (id) {
        		var deferred = $q.defer();
        		$http.get(API_BASE_URL + 'media?id=' + id).then(function (result) {
        			deferred.resolve(result.data);
        		}, function (result) {
        			toastr.error(result.statusText);
        			deferred.reject(result.data);
        		});
        		return deferred.promise;
        	};

        	var updateDescription = function (linkedMedia) {
        		var deferred = $q.defer();
        		$http.put(API_BASE_URL + 'media', linkedMedia, {}).then(function (result) {
        			deferred.resolve(result.data);
        		}, function (result) {
        			toastr.error(result.statusText);
        			deferred.reject(result.data);
        		});
        		return deferred.promise;
        	};

        	var deleteLinkedMedia = function (rowId) {
        		var deferred = $q.defer();
        		$http.delete(API_BASE_URL + 'media?id=' + rowId).then(function (result) {
        			deferred.resolve(result.data);
        		}, function (result) {
        			toastr.error(result.statusText);
        			deferred.reject(result.data);
        		});
        		return deferred.promise;
        	};

        	return {
        		getTaskLinkedMedia: getTaskLinkedMedia,
        		getLinkedMedia: getLinkedMedia,
        		updateDescription: updateDescription,
        		deleteLinkedMedia: deleteLinkedMedia
        	};
        }
    ]);
