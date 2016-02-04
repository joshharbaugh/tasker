angular.module('myVillages.tasker.app.userTask')
    .factory('userTaskDataService', ['API_BASE_URL', '$http', '$q', 'authService', '$window',
        function (API_BASE_URL, $http, $q, authService, $window) {
        	'use strict';

        	var getAllUserTasksSharedWithMe = function () {
        		var deferred = $q.defer();
        		$http.get(API_BASE_URL + 'usertasks/forshareduser').then(function (result) {
        			deferred.resolve(result.data);
        		}, function (result) {
        			toastr.error(result.statusText);
        			deferred.reject(result.data);
        		});
        		return deferred.promise;
        	};

        	var saveStopBugginMePrompt = function (promptKey) {
        		if (!promptKey) return;
        		var deferred = $q.defer();
        		$http({ method: 'POST', url: API_BASE_URL + 'systemuser/adduserpromptunsubscribe/' + promptKey }).then(function (result) {
        			if ($window.userPromptsUnsubscribed.indexOf('postusertasknotoyorequip') <= -1) {
        				$window.userPromptsUnsubscribed.push(promptKey);
        			}
        			deferred.resolve(result.data);
        		}, function (result) {
        			toastr.error(result.statusText);
        			deferred.reject(result.statusText);
        		});
        		return deferred.promise;
        	};

        	var getAllUserSharedWith = function (rowId) {
        		var deferred = $q.defer();
        		$http.get(API_BASE_URL + 'usertasks/' + rowId + '/sharedwithusers').then(function (result) {
        			deferred.resolve(result.data);
        		}, function (result) {
        			toastr.error(result.statusText);
        			deferred.reject(result.data);
        		});
        		return deferred.promise;
        	};

        	var saveSharedWithUser = function (rowId, userRowId) {
        		var deferred = $q.defer();
        		$http({ method: 'POST', url: API_BASE_URL + 'usertasks/' + rowId + '/sharedwithusers/' + userRowId }).then(function (result) {
        			deferred.resolve(result.data);
        		}, function (result) {
        			toastr.error(result.statusText);
        			deferred.reject(result.statusText);
        		});
        		return deferred.promise;
        	};

        	var saveUnSharedWithUser = function (rowId, userRowId) {
        		var deferred = $q.defer();
        		$http({ method: 'DELETE', url: API_BASE_URL + 'usertasks/' + rowId + '/sharedwithusers/' + userRowId }).then(function (result) {
        			deferred.resolve(result.data);
        		}, function (result) {
        			toastr.error(result.statusText);
        			deferred.reject(result.statusText);
        		});
        		return deferred.promise;
        	};

        	var getAllNotes = function (searchArgs) {
        		var deferred = $q.defer();
        		$http.get(API_BASE_URL + 'usertask/notes', { params: searchArgs }).then(function (result) {
        			deferred.resolve(result.data);
        		}, function (result) {
        			toastr.error(result.statusText);
        			deferred.reject(result.data);
        		});
        		return deferred.promise;
        	};

        	var saveNotes = function (args) {
        		var deferred = $q.defer();
        		$http({ method: 'POST', url: API_BASE_URL + 'usertask/note', data: args }).then(function (result) {
        			deferred.resolve(result.data);
        		}, function (result) {
        			toastr.error(result.statusText);
        			deferred.reject(result.statusText);
        		});
        		return deferred.promise;
        	};

        	var getEquipmentUsage = function (equpmentId) {
        		var deferred = $q.defer();
        		$http.get(API_BASE_URL + 'usertask/equipment/usage/' + equpmentId).then(function (result) {
        			deferred.resolve(result.data);
        		}, function (result) {
        			toastr.error(result.statusText);
        			deferred.reject(result.data);
        		});
        		return deferred.promise;
        	};

        	var getAllFeedback = function (rowId) {
        		var deferred = $q.defer();
        		$http.get(API_BASE_URL + 'usertasks/' + rowId + '/feedback').then(function (result) {
        			deferred.resolve(result.data);
        		}, function (result) {
        			toastr.error(result.statusText);
        			deferred.reject(result.data);
        		});
        		return deferred.promise;
        	};

        	var saveFeedback = function (rowId, feedbackItem) {
        		var deferred = $q.defer();
        		var httpMethod;
        		var urlshard;
        		if (feedbackItem.RowId) {
        			httpMethod = 'PUT';
        			urlshard = 'usertasks/' + rowId + '/feedback/' + feedbackItem.RowId;
        		} else {
        			httpMethod = 'POST';
        			urlshard = 'usertasks/' + rowId + '/feedback';
        		}
        		$http({ method: httpMethod, url: API_BASE_URL + urlshard, data: feedbackItem }).then(function (result) {
        			deferred.resolve(result.data);
        		}, function (result) {
        			toastr.error(result.statusText);
        			deferred.reject(result.statusText);
        		});
        		return deferred.promise;
        	};

        	var get = function (rowId) {
        		var deferred = $q.defer();
        		$http.get(API_BASE_URL + 'usertask/' + rowId).then(function (result) {
        			deferred.resolve(result.data);
        		}, function (result) {
        			toastr.error(result.statusText);
        			deferred.reject(result.data);
        		});
        		return deferred.promise;
        	};

        	var getAll = function (searchArgs) {
        		var deferred = $q.defer();
        		$http.get(API_BASE_URL + 'usertask/search', { params: searchArgs }).then(function (result) {
        			deferred.resolve(result.data);
        		}, function (result) {
        			toastr.error(result.statusText);
        			deferred.reject(result.data);
        		});
        		return deferred.promise;
        	};

        	var getAllByFolders = function (searchArgs) {
        		var deferred = $q.defer();
        		$http.get(API_BASE_URL + 'usertasksbyfolders/search', { params: searchArgs }).then(function (result) {
        			deferred.resolve(result.data);
        		}, function (result) {
        			toastr.error(result.statusText);
        			deferred.reject(result.data);
        		});
        		return deferred.promise;
        	};

        	var getTaskById = function (searchArgs) {
        		var deferred = $q.defer();
        		$http.get(API_BASE_URL + 'usertask/taskbyid', { params: searchArgs }).then(function (result) {
        			deferred.resolve(result.data);
        		}, function (result) {
        			toastr.error(result.statusText);
        			deferred.reject(result.data);
        		});
        		return deferred.promise;
        	};

        	var getListById = function (searchArgs) {
        		var deferred = $q.defer();
        		$http.get(API_BASE_URL + 'usertask/listbyid', { params: searchArgs }).then(function (result) {
        			deferred.resolve(result.data);
        		}, function (result) {
        			toastr.error(result.statusText);
        			deferred.reject(result.data);
        		});
        		return deferred.promise;
        	};

        	var getGroupSubGroupsById = function (id, searchArgs) {
        		var deferred = $q.defer();
        		$http.get(API_BASE_URL + 'usertaskgroups/' + id + '/subgroups', { params: searchArgs }).then(function (result) {
        			deferred.resolve(result.data);
        		}, function (result) {
        			toastr.error(result.statusText);
        			deferred.reject(result.data);
        		});
        		return deferred.promise;
        	};

        	var getGroupUserTasksById = function (id, searchArgs) {
        		var deferred = $q.defer();
        		$http.get(API_BASE_URL + 'usertaskgroups/' + id + '/usertasks', { params: searchArgs }).then(function (result) {
        			deferred.resolve(result.data);
        		}, function (result) {
        			toastr.error(result.statusText);
        			deferred.reject(result.data);
        		});
        		return deferred.promise;
        	};

        	var removeGroupUserTasksById = function (groupId, taskId) {
        		var deferred = $q.defer();
        		$http.delete(API_BASE_URL + 'usertaskgroups/' + groupId + '/usertasks/' + taskId).then(function (result) {
        			deferred.resolve(result.data);
        		}, function (result) {
        			deferred.reject(result.data);
        		});
        		return deferred.promise;
        	};

        	var getUserTaskById = function (id) {
        		var deferred = $q.defer();
        		$http.get(API_BASE_URL + 'usertask/' + id).then(function (result) {
        			deferred.resolve(result.data);
        		}, function (result) {
        			toastr.error(result.statusText);
        			deferred.reject(result.data);
        		});
        		return deferred.promise;
        	};

        	var getUserTaskByViewingUser = function (userTask) {
        		var deferred = $q.defer();
        		$http.get(API_BASE_URL + 'usertask/viewinguserdetails', { params: userTask }).then(function (result) {
        			deferred.resolve(result.data);
        		}, function (result) {
        			toastr.error(result.statusText);
        			deferred.reject(result.data);
        		});
        		return deferred.promise;
        	};

        	var save = function (userTask) {
        		var deferred = $q.defer();
        		var httpMethod = 'POST';
        		$http({ method: httpMethod, url: API_BASE_URL + 'usertask', data: userTask }).then(function (result) {
        			deferred.resolve(result.data);
        		}, function (result) {
        			toastr.error(result.statusText);
        			deferred.reject(result.statusText);
        		});
        		return deferred.promise;
        	};

        	var saveMany = function (userTasks) {
        		var deferred = $q.defer();
        		var httpMethod = 'POST';
        		$http({ method: httpMethod, url: API_BASE_URL + 'usertasks', data: userTasks }).then(function (result) {
        			deferred.resolve(result.data);
        		}, function (result) {
        			toastr.error(result.statusText);
        			deferred.reject(result.statusText);
        		});
        		return deferred.promise;
        	};

        	var remove = function (userTask) {
        		var deferred = $q.defer();
        		$http({ method: 'POST', url: API_BASE_URL + 'usertask/delete', data: userTask }).then(function (result) {
        			deferred.resolve(result.data);
        		}, function (result) {
        			toastr.error(result.statusText);
        			deferred.reject(result.data);
        		});
        		return deferred.promise;
        	};

        	var updateStatus = function (userTaskStatus) {
        		var deferred = $q.defer();
        		var httpMethod = 'POST';
        		$http({ method: httpMethod, url: API_BASE_URL + 'usertask/status', data: userTaskStatus }).then(function (result) {
        			deferred.resolve(result.data);
        		}, function (result) {
        			toastr.error(result.statusText);
        			deferred.reject(result.statusText);
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

        	var checkUserExistence = function (emailAddress) {
        		var deferred = $q.defer();
        		$http.get(API_BASE_URL + 'usertask/userexists?emailAddress=' + emailAddress).then(function (result) {
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

        	var getAuthorizedClients = function (keyword) {
        		var deferred = $q.defer();
        		$http.get(API_BASE_URL + 'usertask/authorizedclients?searchKeyword=' + keyword).then(function (result) {
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

        	var getSuggestedServiceTechs = function (keyword) {
        		var deferred = $q.defer();
        		$http.get(API_BASE_URL + 'usertask/suggestservicetechs?searchKeyword=' + keyword).then(function (result) {
        			deferred.resolve(result.data);
        		}, function (result) {
        			toastr.error(result.statusText);
        			deferred.reject(result.data);
        		});
        		return deferred.promise;
        	};

        	var getSuggestedServiceTechsDm = function (keyword) {
        		var deferred = $q.defer();
        		$http.get(API_BASE_URL + 'usertask/suggestservicetechsDm?searchKeyword=' + keyword).then(function (result) {
        			deferred.resolve(result.data);
        		}, function (result) {
        			toastr.error(result.statusText);
        			deferred.reject(result.data);
        		});
        		return deferred.promise;
        	};

        	var getSuggestedSubcontractor = function (keyword) {
        		var deferred = $q.defer();
        		$http.get(API_BASE_URL + 'usertask/suggestsubcontractors?searchKeyword=' + keyword).then(function (result) {
        			deferred.resolve(result.data);
        		}, function (result) {
        			toastr.error(result.statusText);
        			deferred.reject(result.data);
        		});
        		return deferred.promise;
        	};

        	var getAllSubcontractors = function (searchArgs) {
        		var deferred = $q.defer();
        		$http.get(API_BASE_URL + 'usertask/subcontractor', { params: searchArgs }).then(function (result) {
        			deferred.resolve(result.data);
        		}, function (result) {
        			toastr.error(result.statusText);
        			deferred.reject(result.data);
        		});
        		return deferred.promise;
        	};

        	var saveContact = function (taskUser) {
        		var deferred = $q.defer();
        		$http({ method: 'POST', url: API_BASE_URL + 'usertask/contact', data: taskUser }).then(function (result) {
        			deferred.resolve(result.data);
        		}, function (result) {
        			toastr.error(result.statusText);
        			deferred.reject(result.data);
        		});
        		return deferred.promise;
        	};

        	var getToyEquipment = function (toyId) {
        		var deferred = $q.defer();
        		$http.get(API_BASE_URL + 'usertask/toy/equipment/' + toyId).then(function (result) {
        			deferred.resolve(result.data);
        		}, function (result) {
        			toastr.error(result.statusText);
        			deferred.reject(result.data);
        		});
        		return deferred.promise;
        	};

        	var assignServiceTech = function (args) {
        		var deferred = $q.defer();
        		$http({ method: 'POST', url: API_BASE_URL + 'usertask/servicetech', data: args }).then(function (result) {
        			deferred.resolve(result.data);
        		}, function (result) {
        			toastr.error(result.statusText);
        			deferred.reject(result.statusText);
        		});
        		return deferred.promise;
        	};

        	var removeServiceTech = function (args) {
        		var deferred = $q.defer();
        		$http.delete(API_BASE_URL + 'usertask/servicetech', { params: args }).then(function (result) {
        			deferred.resolve(result.data);
        		}, function (result) {
        			toastr.error(result.statusText);
        			deferred.reject(result.statusText);
        		});
        		return deferred.promise;
        	};

        	var assignSubcontractor = function (args) {
        		var deferred = $q.defer();
        		$http({ method: 'POST', url: API_BASE_URL + 'usertask/subcontractor', data: args }).then(function (result) {
        			deferred.resolve(result.data);
        		}, function (result) {
        			toastr.error(result.statusText);
        			deferred.reject(result.statusText);
        		});
        		return deferred.promise;
        	};

        	var removeSubcontractor = function (args) {
        		var deferred = $q.defer();
        		$http.delete(API_BASE_URL + 'usertask/subcontractor', { params: args }).then(function (result) {
        			deferred.resolve(result.data);
        		}, function (result) {
        			toastr.error(result.statusText);
        			deferred.reject(result.statusText);
        		});
        		return deferred.promise;
        	};

        	var getSubcontractorNotes = function (searchArgs) {
        		var deferred = $q.defer();
        		$http.get(API_BASE_URL + 'usertask/subcontractor/notes', { params: searchArgs }).then(function (result) {
        			deferred.resolve(result.data);
        		}, function (result) {
        			toastr.error(result.statusText);
        			deferred.reject(result.statusText);
        		});
        		return deferred.promise;
        	};

        	var saveSubcontractorNote = function (args) {
        		var deferred = $q.defer();
        		$http({ method: 'POST', url: API_BASE_URL + 'usertask/subcontractor/note', data: args }).then(function (result) {
        			deferred.resolve(result.data);
        		}, function (result) {
        			toastr.error(result.statusText);
        			deferred.reject(result.statusText);
        		});
        		return deferred.promise;
        	};

        	var getSupervisorTasks = function (searchArgs) {
        		var deferred = $q.defer();
        		$http.get(API_BASE_URL + 'usertask/supervisortasks', { params: searchArgs }).then(function (result) {
        			deferred.resolve(result.data);
        		}, function (result) {
        			toastr.error(result.statusText);
        			deferred.reject(result.statusText);
        		});
        		return deferred.promise;
        	};

        	var assignSupervisor = function (args) {
        		var deferred = $q.defer();
        		$http({ method: 'POST', url: API_BASE_URL + 'usertask/assignsupervisor', data: args }).then(function (result) {
        			deferred.resolve(result.data);
        		}, function (result) {
        			toastr.error(result.statusText);
        			deferred.reject(result.statusText);
        		});
        		return deferred.promise;
        	};

        	// added reassign subcontractor
        	var reassignSubcontractorSupervisor = function (args) {
        		var deferred = $q.defer();
        		$http({ method: 'POST', url: API_BASE_URL + 'usertask/reassignsubcontractor', data: args }).then(function (result) {
        			deferred.resolve(result.data);
        		}, function (result) {
        			toastr.error(result.statusText);
        			deferred.reject(result.statusText);
        		});
        		return deferred.promise;
        	};

        	var persistTaskSortView = function (taskViewModel) {
        		var deferred = $q.defer();
        		$http({ method: 'POST', url: API_BASE_URL + 'api/usertaskview', data: taskViewModel }).then(function (result) {
        			deferred.resolve(result.data);
        		}, function (result) {
        			toastr.error(result.statusText);
        			deferred.reject(result.statusText);
        		});
        		return deferred.promise;
        	};

        	var persistListSortView = function (listIds) {
        		var deferred = $q.defer();
        		$http({ method: 'POST', url: API_BASE_URL + 'api/usertaskgroupview', data: listIds }).then(function (result) {
        			deferred.resolve(result.data);
        		}, function (result) {
        			toastr.error(result.statusText);
        			deferred.reject(result.statusText);
        		});
        		return deferred.promise;
        	};

        	var persistTaskRating = function (userTaskRowId, rating) {
        		var deferred = $q.defer();
        		var taskRatingViewModel = {
        			UserTaskRowId: userTaskRowId,
        			Rating: rating
        		};
        		$http({ method: 'POST', url: API_BASE_URL + 'api/usertaskrating', data: taskRatingViewModel }).then(function (result) {
        			deferred.resolve(result.data);
        		}, function (result) {
        			toastr.error(result.statusText);
        			deferred.reject(result.statusText);
        		});
        		return deferred.promise;
        	};

        	var persistTaskGroupRating = function (userTaskGroupRowId, rating) {
        		var deferred = $q.defer();
        		var taskGroupRatingViewModel = {
        			UserTaskGroupRowId: userTaskGroupRowId,
        			Rating: rating
        		};
        		$http({ method: 'POST', url: API_BASE_URL + 'api/usertaskgrouprating', data: taskGroupRatingViewModel }).then(function (result) {
        			deferred.resolve(result.data);
        		}, function (result) {
        			toastr.error(result.statusText);
        			deferred.reject(result.statusText);
        		});
        		return deferred.promise;
        	};

        	return {
        		getAll: getAll,
        		getAllByFolders: getAllByFolders,
        		getTaskById: getTaskById,
        		getListById: getListById,
        		getGroupSubGroupsById: getGroupSubGroupsById,
        		getGroupUserTasksById: getGroupUserTasksById,
        		getUserTaskById: getUserTaskById,
        		get: get,
        		save: save,
        		saveMany: saveMany,
        		updateStatus: updateStatus,
        		checkUserExistence: checkUserExistence,
        		getSuggestedContacts: getSuggestedContacts,
        		getSuggestedClients: getSuggestedClients,
        		getAuthorizedClients: getAuthorizedClients,
        		getSuggestedServiceTechs: getSuggestedServiceTechs,
        		getSuggestedServiceTechsDm: getSuggestedServiceTechsDm,
        		getSuggestedServiceProviders: getSuggestedServiceProviders,
        		getSuggestedSubcontractor: getSuggestedSubcontractor,
        		remove: remove,
        		removeGroupUserTasksById: removeGroupUserTasksById,
        		getToyEquipment: getToyEquipment,
        		getAllFeedback: getAllFeedback,
        		getEquipmentUsage: getEquipmentUsage,
        		saveFeedback: saveFeedback,
        		getAllNotes: getAllNotes,
        		saveNotes: saveNotes,
        		saveContact: saveContact,
        		getAllUserSharedWith: getAllUserSharedWith,
        		saveSharedWithUser: saveSharedWithUser,
        		saveUnSharedWithUser: saveUnSharedWithUser,
        		getAllUserTasksSharedWithMe: getAllUserTasksSharedWithMe,
        		saveStopBugginMePrompt: saveStopBugginMePrompt,
        		assignServiceTech: assignServiceTech,
        		removeServiceTech: removeServiceTech,
        		assignSubcontractor: assignSubcontractor,
        		removeSubcontractor: removeSubcontractor,
        		getSupervisorTasks: getSupervisorTasks,
        		getUserTaskByViewingUser: getUserTaskByViewingUser,
        		getAllSubcontractors: getAllSubcontractors,
        		getSubcontractorNotes: getSubcontractorNotes,
        		saveSubcontractorNote: saveSubcontractorNote,
        		assignSupervisor: assignSupervisor,
        		reassignSubcontractorSupervisor: reassignSubcontractorSupervisor,
        		persistTaskSortView: persistTaskSortView,
        		persistListSortView: persistListSortView,
        		persistTaskRating: persistTaskRating,
        		persistTaskGroupRating: persistTaskGroupRating
        	};
        }
    ]);