angular.module('myVillages.tasker.app.userTasksUserXref')
    .factory('userTasksUserXrefDataService', ['API_BASE_URL', '$http', '$q',
        function (API_BASE_URL, $http, $q) {
        	'use strict';

        	var getTaskUsersList = function (userTaskSearchArgs) {
        		var deferred = $q.defer();
        		$http.get(API_BASE_URL + 'usertask/users', { params: userTaskSearchArgs }).then(function (result) {
        			deferred.resolve(result.data);
        		}, function (result) {
        			toastr.error(result.statusText);
        			deferred.reject(result.data);
        		});
        		return deferred.promise;
        	};

        	var getAssignedUser = function (userTaskId) {
        		var deferred = $q.defer();
        		$http.get(API_BASE_URL + 'usertask/user?userTaskId=' + userTaskId).then(function (result) {
        			deferred.resolve(result.data);
        		}, function (result) {
        			toastr.error(result.statusText);
        			deferred.reject(result.data);
        		});
        		return deferred.promise;
        	};

        	var getSuggestedContacts = function (keyword) {
        		var deferred = $q.defer();
        		$http.get(API_BASE_URL + 'usertask/contacts?searchKeyword=' + keyword).then(function (result) {
        			deferred.resolve(result.data);
        		}, function (result) {
        			toastr.error(result.statusText);
        			deferred.reject(result.data);
        		});
        		return deferred.promise;
        	};

        	var getSuggestedClients = function (keyword) {
        		var deferred = $q.defer();
        		$http.get(API_BASE_URL + 'usertask/clients?searchKeyword=' + keyword).then(function (result) {
        			deferred.resolve(result.data);
        		}, function (result) {
        			toastr.error(result.statusText);
        			deferred.reject(result.data);
        		});
        		return deferred.promise;
        	};

        	var getOtherSupervisors = function (userId) {
        		var deferred = $q.defer();
        		$http.get(API_BASE_URL + 'usertask/supervisors?userId=' + userId).then(function (result) {
        			deferred.resolve(result.data);
        		}, function (result) {
        			toastr.error(result.statusText);
        			deferred.reject(result.data);
        		});
        		return deferred.promise;
        	};

        	var saveAssignedUser = function (userTaskUserXref) {
        		var deferred = $q.defer();
        		$http({ method: 'POST', url: API_BASE_URL + 'usertask/user', data: userTaskUserXref }).then(function (result) {
        			deferred.resolve(result.data);
        		}, function (result) {
        			toastr.error(result.statusText);
        			deferred.reject(result.statusText);
        		});
        		return deferred.promise;
        	};

        	var getMyFoldersList = function () {
        		var deferred = $q.defer();
        		$http.get(API_BASE_URL + 'usertaskfolders').then(function (result) {
        			deferred.resolve(result.data);
        		}, function (result) {
        			toastr.error(result.statusText);
        			deferred.reject(result.data);
        		});
        		return deferred.promise;
        	};

        	return {
        		getTaskUsersList: getTaskUsersList,
        		getAssignedUser: getAssignedUser,
        		getSuggestedContacts: getSuggestedContacts,
        		getSuggestedClients: getSuggestedClients,
        		getOtherSupervisors: getOtherSupervisors,
        		saveAssignedUser: saveAssignedUser,
        		getMyFoldersList: getMyFoldersList
        	};
        }
    ]);