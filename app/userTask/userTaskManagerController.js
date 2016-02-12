angular.module('myVillages.tasker.app.userTask')
    .config(['$provide', function ($provide) {
    	$provide.decorator('accordionDirective', ['$delegate', function ($delegate) {
    		var directive = $delegate[0];
    		directive.replace = true;
    		return $delegate;
    	}]);
    }])
    .controller('UserTaskManagerController', ['$scope', '$upload', 'authService', 'userTaskDataService', 'supervisorDataService', 'userTasksUserXrefDataService', 'userTaskMessagesDataService', 'serviceTechDataService', 'dataService', 'taskStatus', 'taskAction', 'taskQueue', 'linkedListType', 'reminderActionKeywords', '$modal', '$location', '$q', '$rootScope', '$timeout', '$filter', '$routeParams', '$cookieStore', '$window',
        function ($scope, $upload, authService, userTaskDataService, supervisorDataService, userTasksUserXrefDataService, userTaskMessagesDataService, serviceTechDataService, dataService, taskStatus, taskAction, taskQueue, linkedListType, reminderActionKeywords, $modal, $location, $q, $rootScope, $timeout, $filter, $routeParams, $cookieStore, $window) {
        	'use strict';
        	$scope.selectedRate = 0;
        	$scope.max = 5;
        	$scope.hoveringOver = function (value) {
        		$scope.overStar = value;
        	};

        	function clearTaskGroupRating(userTaskGroup) {
        		userTaskGroup.Rating = 0;
        		userTaskDataService.persistTaskGroupRating(userTaskGroup.RowId, 0);
        	};

        	function updateTaskGroupRating(userTaskGroup) {
        		userTaskDataService.persistTaskGroupRating(userTaskGroup.RowId, userTaskGroup.Rating);
        	};

        	if ($cookieStore.get('tasker-panels')) {
        		// get sort order from stored session cookie
        		$scope.panels = JSON.parse($cookieStore.get('tasker-panels'));
        		// we could use the saved state of the panel (ie. open / closed)
        		// but for now just reset the collapsed state
        		angular.forEach($scope.panels, function (panel) {
        			switch (panel.title) {
        				case 'MyFolders':
        					panel.open = $routeParams.myFolder ? true : false;
        					break;
        				default:
        					panel.open = true;
        			}
        		});
        	} else {
        		// default sort order of panels
        		$scope.panels = [
                    { title: 'Search', open: true },
                    { title: 'Reminders', open: true },
                    { title: 'MyFolders', open: $routeParams.myFolder ? true : false },
                    { title: 'Filters', open: true }
        		];
        	}

        	// attach drag 'n' drop events to the element with .handle class
        	$scope.sortableOptions = {
        		handle: ' .handle'
        	};

            //-- ui-sortable
        	var taskHandle,
                taskListHandle,
                dragDistance,
                taskSortDelay;

        	if ($rootScope.isMobile) {
        	    taskHandle = '.glyphicon-move',
                taskListHandle = '.title .glyphicon-list',
                dragDistance = 10, // only start dragging if the element moves 10 pixels
        	    taskSortDelay = 500; // for swiping on mobile
        	}
        	else {
        	    taskHandle = '.task-header',
                taskListHandle = '.task-group .title',
                dragDistance = 10, // only start dragging if the element moves 10 pixels
        	    taskSortDelay = 0; // no delay for desktops
        	}

            // standard tasks
        	$scope.sortableTasksOpts = {
        		delay: taskSortDelay,
        		connectWith: '.sortable-tasks',
        		handle: taskHandle,
        		distance: dragDistance,
        		stop: function (e, ui) {
        			var data = ui.item.sortable,
                        model = data.model,
                        sourceModel = data.sourceModel,
                        userTaskGroupRowId = data.model.UserTaskGroupRowId
        			if (!data.droptargetModel) return

        			var taskViewModel, source_ids, target_ids,
                        promises = []

        			var sourcelistid = parseInt(data.source[0].dataset['parentRowId']),
                        targetlistid = parseInt(data.droptarget[0].dataset['parentRowId'])

        			// persist target (dropped) list
        			target_ids = _.map(data.droptargetModel, function (model) { return model.RowId })

        			taskViewModel = {
        				userTaskRowIds: target_ids,
        				userTaskGroupRowId: targetlistid ? targetlistid : null
        			};

        			if (sourcelistid !== targetlistid) {
        				if (targetlistid === 0) {
        					// moved to Inbox (unlink it)
        					promises.push(dataService.remove('UserTaskGroupXref', data.model.UserTaskGroupXrefRowId))
        					promises.push(userTaskDataService.persistTaskSortView(taskViewModel))
        					if ($scope.individualTasksList.TaskCount)
        						$scope.individualTasksList.TaskCount++;
        				}
        				else {
        					promises.push(userTaskDataService.persistTaskSortView(taskViewModel))

        					// moved from one folder/list to another
        					var userTaskGroupXref = {
        						UserTaskRowId: data.model.RowId,
        						UserTaskGroupRowId: targetlistid
        					};
        					var togglePromise = toggleUserTaskGroupAssignment(userTaskGroupXref)
        					promises.push(togglePromise)
        				}
        			} else {
        				promises.push(userTaskDataService.persistTaskSortView(taskViewModel))
        			}

        			$q.all(promises).then(function (results) {
        				try {
        					var list = _.findWhere($scope.userTasksGroupsList, {
        						RowId: userTaskGroupRowId
        					})

        					if (list) list.TaskCount--
        					else $scope.individualTasksList.TaskCount--
        				}
        				catch (e) { }
        			})
        		}
        	};

            // shared tasks
        	$scope.sortableSharedTasksOpts = {
        		delay: taskSortDelay,
        		connectWith: '.sortable-shared-tasks',
        		handle: taskHandle,
        		distance: dragDistance,
        		stop: function (e, ui) {
        			var data = ui.item.sortable
        			if (!data.droptargetModel) return

        			var taskViewModel, target_ids,
                        promises = []

        			var targetlistid = parseInt(data.droptarget[0].dataset['parentRowId'])

        			// persist target (dropped) list
        			target_ids = _.map(data.droptargetModel, function (model) { return model.RowId })

        			taskViewModel = {
        				userTaskRowIds: target_ids,
        				userTaskGroupRowId: targetlistid ? targetlistid : null
        			};

        			userTaskDataService.persistTaskSortView(taskViewModel)
        		}
        	};

            // task lists
        	$scope.sortableListsOpts = {
        		delay: taskSortDelay,
        		connectWith: '.sortable-lists',
        		handle: taskListHandle,
        		distance: dragDistance,
        		stop: function (e, ui) {
        			var data = ui.item.sortable,
                        model = data.model,
        	            sourceParentGroupRowId = data.model.ParentGroupRowId
        			if (!data.droptargetModel) return

        			var promises = [],
                        targetlistid = parseInt(data.droptarget[0].dataset['parentGroupRowId'])

        			var ids = _.map(
                        _.filter(data.droptargetModel, function (m) {
                        	return !m.IsFolder
                        }), function (model) {
                        	return model.RowId
                        });

        			if (data.model.ParentGroupRowId && parseInt(targetlistid) == 0) {
        				// Unbind list
        				data.model.ParentGroupRowId = null;
        				promises.push(dataService.update('UserTaskGroup', data.model.RowId, data.model))
        			} else {
        				data.model.ParentGroupRowId = (parseInt(targetlistid) == 0) ? null : parseInt(targetlistid)

        				if (data.model.ParentGroupRowId)
        					promises.push(dataService.update('UserTaskGroup', data.model.RowId, data.model))
        			}

        			promises.push(userTaskDataService.persistListSortView(ids))

        			$q.all(promises).then(function (results) {
        				// update counts
        				var list, sourceList

        				if (results[0].TaskCount && !results[0].ParentGroupRowId) {
        					$scope.individualTasksList.TaskCount = ($scope.individualTasksList.TaskCount + results[0].TaskCount)
        				} else {
        					list = _.findWhere($scope.userTasksGroupsList, { RowId: results[0].ParentGroupRowId })
        					if (list) list.TaskCount = (list.TaskCount + model.TaskCount)
        				}

        				try {
        					sourceList = _.findWhere($scope.userTasksGroupsList, {
        						RowId: sourceParentGroupRowId
        					})

        					if (sourceList)
        						sourceList.TaskCount = (sourceList.TaskCount - model.TaskCount)
        					else
        						$scope.individualTasksList.TaskCount = ($scope.individualTasksList.TaskCount - model.TaskCount)
        				}
        				catch (e) { }
        			})
        		}
        	};
            //-- end ui-sortable

        	$scope.$watch('panels', function (panels) {
        		if (panels) {
        			// when our local scope changes, save the new ordering to our cookiestore
        			$cookieStore.put('tasker-panels', JSON.stringify(panels));
        		}
        	}, true);

        	function getSupervisors() {
        		supervisorDataService.getSupervisors($scope.authInfo.businessRowId).then(function (result) {
        			$scope.supervisors = result;
        		});
        	};

        	function getSubcontractors() {
        		supervisorDataService.getSubcontractors($scope.authInfo.userRowId).then(function (result) {
        			$scope.subcontractors = result;
        		});
        	};

        	function initialize() {
        		$scope.isInboxOpen = false;
        		$scope.isGroupId = false;
        		$scope.routeParams = $routeParams;
        		getMyFoldersList();
        		getMyStuff();
        		$scope.isVisible.
        	            isViewableByOwner = ($scope.authInfo.isBusinessSupervisor || $scope.authInfo.isBusinessPremium);
        	            

        		if (authService.getAuthInfo().isBusinessSupervisor) {
        			getSupervisors();
        			getSubcontractors();
        		}
        		if (!$routeParams.reminders) {
        			$scope.searchReminders();
        		}
        		if ($routeParams.reminders && $routeParams.clientId) {
        			$scope.isInboxOpen = true;
        			$scope.searchRemindersOnBehalfOfUserId($routeParams.filterStatus);
        			$scope.selectRemindersInbox($routeParams.filterStatus);
        		}
        		if ($routeParams.clientSearch) {
        			$scope.searchFilters.clientKeyword = {
        				TypeaheadDisplay: $routeParams.clientName,
        				Client: {
        					RowId: $routeParams.clientId,
        				},
        				UserToy: {
        					RowId: 0,
        					ToyName: '',
        				},
        			};
        			$scope.clientTasks.isClientTasksLoaded = true;
        			$scope.searchClientTasks();
        		}
        		if ($routeParams.toySearch) {
        			$scope.searchFilters.clientKeyword = {
        				TypeaheadDisplay: $routeParams.clientName + ' | ' + $routeParams.toyName,
        				Client: {
        					RowId: $routeParams.clientId,
        				},
        				UserToy: {
        					RowId: $routeParams.toyId,
        					ToyName: $routeParams.toyName,
        				},
        			};
        			$scope.clientTasks.isClientTasksLoaded = true;
        			$scope.searchClientTasks();
        		}
        		if ($routeParams.myFolder) {
        			// set our selected folder / list
        			var group;
        			$scope.$watch('userTasksGroupsList', function (userTasksGroupsList) {
        				if (userTasksGroupsList && userTasksGroupsList.length > 0) {
        					group = _.where(userTasksGroupsList, { Title: $routeParams.myFolder })[0];
        					if (group) $rootScope.$broadcast('setSelectedList', { list: group, context: group.isFolder });
        				}
        			});
        		}
        		if ($routeParams.taskId) {
        			// get individual task in its list
        			$scope.activePrimaryQueue = -1;
        			$scope.isVisible.isSpinner = true;
        			var userTaskSearchArgs = {
        				SearchType: 1, // search user tasks
        				RowId: $routeParams.taskId,
        			};
        			userTaskDataService.getTaskById(userTaskSearchArgs).then(function (result) {
        				$scope.listOrTaskById = {
        					isTaskById: true,
        					taskId: $routeParams.taskId,
        					isListById: false,
        					listId: 0,
        					listOrTaskByIdTasks: result.UserTaskFoldersList,
        					dontSearchOnClear: true,
        				};
        				$scope.primaryQueueList = result.PrimaryQueueList;
        				$scope.isFiltersLoaded = true;
        			});
        			$scope.isVisible.isSpinner = false;
        		}
        		if ($routeParams.groupId) {
        			// get specified list tasks
        			$scope.activePrimaryQueue = -1;
        			$scope.isVisible.isSpinner = true;
        			$scope.isGroupId = true;
        			var list,
                        userTaskSearchArgs = {
                        	SearchType: 1, // search user tasks
                        	UserTaskGroupRowId: $routeParams.groupId,
                        	ToyRowId: $routeParams.toyId,
                        	EquipmentRowId: $routeParams.equipmentId,
                        	CompletedByUserId: $routeParams.completedBy,
                        	Keyword: $routeParams.keyword,
                        	StartDate: $routeParams.startDate,
                        	EndDate: $routeParams.endDate,
                        	IsShowCancelled: $routeParams.showCancelled,
                        };
        			userTaskDataService.getListById(userTaskSearchArgs).then(function (result) {
        				$scope.listOrTaskById = {
        					isTaskById: false,
        					taskId: 0,
        					isListById: true,
        					listId: $routeParams.groupId,
        					listOrTaskByIdTasks: result.UserTaskFoldersList,
        					dontSearchOnClear: true,
        				};
        				$scope.primaryQueueList = result.PrimaryQueueList;
        				$scope.isFiltersLoaded = true;

        				if (result.UserTaskFoldersList && result.UserTaskFoldersList.length > 0) {
        					// search
        					list = _.findWhere(result.UserTaskFoldersList, { RowId: parseInt($routeParams.groupId) });
        					if (list) {
        						$rootScope.$broadcast('setSelectedList', { list: list, context: null });
        					}
        					else {
        						// search GroupSubGroups (lists)
        						list = _.findWhere(result.UserTaskFoldersList[0].GroupSubGroups, { RowId: parseInt($routeParams.groupId) });

        						if (list) $rootScope.$broadcast('setSelectedList', { list: list, context: null });
        					}
        				}
        			});
        			$scope.isVisible.isSpinner = false;
        		}
        	};

        	function getMyFoldersList() {
        		return userTasksUserXrefDataService.getMyFoldersList().then(function (result) {
        			$scope.myFoldersList = result;
        		});
        	};

        	function getMyStuff() {
        		var toySearchArgs = {
        			OwnerId: userRowId,
        			OrderBy: 'DateCreated'
        		};
        		dataService.getAll('MyStuff', toySearchArgs, {}).then(function (result) {
        			$scope.userToys = result;
        		});
        	};

        	function getTaskUsersList(data, userType) {
        		var userTaskSearchArgs = {
        			TaskUserRowId: $scope.authInfo.userRowId,
        			TypeaheadUserType: userType,
        			Keyword: data,
        		};
        		return userTasksUserXrefDataService.getTaskUsersList(userTaskSearchArgs);
        	};

        	function getServiceTechs() {
        		var args = { IsActive: true, IsDeleted: false };
        		return serviceTechDataService.getAll(args);
        	}

        	function menuClass(page) {
        		var current = $location.path().substring(1);
        		return page === current ? "active" : "hideForOffline";
        	};

        	$scope.$on('event:tasksLoaded', function () {
        		$timeout(function () {
        			if ($scope.isVisible.isSpinner) $scope.isVisible.isSpinner = false;
        			if ($routeParams.taskgroupid) {
        				for (var i = 0; i < $scope.userTasksGroupsList.length; i++) {
        					var mylist = $scope.userTasksGroupsList[i];
        					if ('RowId' in mylist && mylist.RowId && mylist.RowId == $routeParams.taskgroupid) {
        						$scope.taskLists.selectedTasksList = mylist;
        						$rootScope.$broadcast('setSelectedList', { list: mylist, context: false });
        					}
        				}
        			}
                    // manually init tooltip plugin once lists, folders, and inbox tasks are loaded
        			$timeout(function() {
        			    $('[data-toggle="tooltip"]').tooltip()
        			})
        		});
        	});

        	$rootScope.$on('counts.updated', function (e, data) {
        		if (data) {
        			$timeout(function () {
        				if (data.count && !data.RowId) { $scope.individualTasksList.TaskCount = data.count; }
        				else {
        					var list, lists = fn($scope.userTasksGroupsList, data.RowId);
        					if (lists && lists.length > 0) {
        						list = lists[0];
        						if (list.TaskCount) { list.TaskCount = data.count; }
        					}
        				}
        			});
        		}
        	});

        	$rootScope.$on('group.deleted', function (e, data) {
        		if (data) {
        			$timeout(function () {
        				// remove the right pane
        				var idx = $scope.userTasksGroupsList.map(function (x) { return x.RowId; }).indexOf(data.group.RowId);
        				if (idx !== -1) $scope.userTasksGroupsList.splice(idx, 1);

        				// pick up the new placement of tasks and task lists (most likely the Inbox)
        				if ((data.group.GroupTasks && data.group.GroupTasks.length > 0) || (data.group.GroupSubGroups && data.group.GroupSubGroups.length > 0)) $scope.searchUserTasks()
        			});
        		}
        	});

        	var requestTimeout;

        	function searchUserTasks(isProSearchingFromSidebar) {
        		if (isProSearchingFromSidebar) {
        			$location.search('myFolder', null);
        			$scope.taskLists.selectedTasksList = [];
        		}
        		if ($scope.otherSupervisors.isOtherSupervisorsQueue) {
        			$scope.otherSupervisors.supervisorSearchType = 3; // search supervisor tasks
        			getSupervisorTasks($scope.otherSupervisors.selectedSupervisorId, $scope.otherSupervisors.selectedSupervisorName);
        			return;
        		}
        		clearTimeout(requestTimeout);
        		requestTimeout = setTimeout(function () {
        			$scope.isVisible.isSpinner = true;
        			if ($routeParams.assignedUserId) {
        				$scope.searchFilters.assignedUser = {};
        				$scope.searchFilters.assignedUser['RowId'] = $routeParams.assignedUserId;
        			}
        			var searchRating = $('#listRatingsSearch').attr('aria-valuenow') || null;
        			var userTaskSearchArgs = {
        				SearchType: 1, // search user tasks
        				TaskUserRowId: $routeParams.clientId ? $routeParams.clientId : $scope.authInfo.userRowId,
        				Keyword: $scope.searchFilters.keyword,
        				Status: $scope.searchFilters.status == null ? taskStatus.All : $scope.searchFilters.status.Value,
        				CreatedByUserId: $scope.searchFilters.createUser == null ? null : $scope.searchFilters.createUser.RowId,
        				LastModByUserId: $scope.searchFilters.lastModUser == null ? null : $scope.searchFilters.lastModUser.RowId,
        				AssignedUserId: $scope.searchFilters.assignedUser == null ? null : $scope.searchFilters.assignedUser.RowId,
        				AssignedServiceTechId: $scope.searchFilters.assignedServiceTech == null ? null : $scope.searchFilters.assignedServiceTech.RowId,
        				CompletedByUserId: $scope.searchFilters.completeUser == null ? null : $scope.searchFilters.completeUser.RowId,
        				CreateDate: $scope.searchFilters.createDate,
        				LastModDate: $scope.searchFilters.lastModDate,
        				RequestedCompletionDate: $scope.searchFilters.requestedCompletionDate,
        				CompleteDate: $scope.searchFilters.completeDate,
        				IsFiltersLoaded: $scope.isFiltersLoaded,
        				ToyRowId: $routeParams.toyId ? $routeParams.toyId : null,
        				TaskQueue: $scope.selectedTaskQueue ? $scope.selectedTaskQueue : null,
        				Rating: searchRating == 0 ? null : searchRating
        			};
        			searchTasks(userTaskSearchArgs);
        		}, 1000); // delay requests by ~1 sec
        	};

        	function searchTasks(userTaskSearchArgs) {
        		if ($scope.activePrimaryQueue == -1) {
        			$scope.activePrimaryQueue = taskQueue.Open;
        			$scope.listOrTaskById = {
        				isTaskById: false,
        				taskId: 0,
        				isListById: false,
        				listId: 0,
        				listOrTaskByIdTasks: {},
        				dontSearchOnClear: false,
        			};
        		}
        		if ($scope.taskLists.selectedTasksList.Title) {
        			$timeout(function () {
        				console.log('toggling', $scope.taskLists.selectedTasksList.Title)
        				$scope.taskLists.selectedTasksList.open = !$scope.taskLists.selectedTasksList.open;
        				$scope.toggleUserTaskGroup($scope.taskLists.selectedTasksList);
        				$scope.isQueue = false;
        				$scope.isVisible.isSpinner = false;
        			});
        			return;
        		}
        		if ($scope.numSelected > 0) {
        			$scope.toggleSelectedTaskList($scope.taskLists.selectedTasksList);
        		}
        		var userTaskPromise = userTaskDataService.getAllByFolders(userTaskSearchArgs);
        		var serviceTechsPromise;
        		if (authService.getAuthInfo().isBusinessSupervisor) {
        			serviceTechsPromise = getServiceTechs();
        		} else {
        			serviceTechsPromise = $q.when([]);
        		};
        		$q.all([userTaskPromise, serviceTechsPromise]).then(function (result) {
        			$scope.individualTasksList.GroupTasks = $filter('orderBy')(result[0].UngrouppedTasksList, 'SortOrder')
        			$scope.individualTasksList.TaskCount = $scope.individualTasksList.GroupTasks.length;
        			console.log(new Date().toUTCString(), 'promises resolved');
        			$scope.sharedTasksList = $filter('orderBy')(result[0].SharedTasksList, 'SortOrder');
        			$scope.userTasksGroupsList = $filter('orderBy')(result[0].UserTasksGroupsList, 'SortOrder');

        			// set our ungroupped count total here (filtering by task lists inside of the Inbox)
        			$scope.inboxGroupsList = $filter('filter')($scope.userTasksGroupsList, $scope.inboxList)
        			angular.forEach($scope.inboxGroupsList, function (object) {
        				if (object.TaskCount && object.TaskCount > 0) {
        					$scope.individualTasksList.TaskCount += object.TaskCount;
        				}
        			});

        			$scope.primaryQueueList = result[0].PrimaryQueueList;
        			if ($scope.taskLists.selectedTasksList.Title) {
        				var lists = _.where($scope.userTasksGroupsList, { RowId: $scope.taskLists.selectedTasksList.RowId });
        				if (lists.length == 1) {
        					$scope.taskLists.selectedTasksList = lists[0];
        					$scope.taskLists.isLoaded = true;
        					$scope.isQueue = false;
        				}
        			}
        			else {
        				$scope.isQueue = true;
        			};
        			if (!$scope.isFiltersLoaded) {
        				$scope.statuses = result[0].TaskStatusesList;
        				$scope.createdByUsers = result[0].CreatedByUsersList;
        				$scope.lastModByUsersList = result[0].LastModByUsersList;
        				$scope.assignedUsersList = result[0].AssignedUsersList;
        				$scope.completedByUsers = result[0].CompletedByUsersList;
        				$scope.isFiltersLoaded = true;
        			};
        			$scope.serviceTechs = result[1];
        			$scope.clientTasks.isClientTasksTitle = true;
        			$scope.clientTasks.isClientTasksLoaded = false;
        			if (parseInt($scope.activePrimaryQueue) !== 1) {
        				$scope.selectUserTaskQueue($scope.activePrimaryQueue);
        			}
        			$timeout(function () {
        				$scope.$broadcast('event:tasksLoaded');
        			});
        		});
        	};

        	$scope.$on('event:containerHeightChange', function (event, args) {
        		if (!window.isMobile()) {
        			// we only need to do this on non-mobile devices
        			$timeout(function () {
        				$scope.appContainerHeight = args.height;
        			}, 1000);
        		}
        	});

        	function searchClientTasks(isProSearchingFromSidebar) {
        		if (isProSearchingFromSidebar) {
        			$location.search('myFolder', null);
        			$scope.taskLists.selectedTasksList = [];
        		}
        		if ($scope.searchFilters.clientKeyword != null) {
        			if ($scope.otherSupervisors.isOtherSupervisorsQueue) {
        				$scope.otherSupervisors.supervisorSearchType = 2; // search supervisor client tasks
        				getSupervisorTasks($scope.otherSupervisors.selectedSupervisorId, $scope.otherSupervisors.selectedSupervisorName);
        				return;
        			}
        			var userTaskSearchArgs = {
        				SearchType: 2, // search client tasks
        				TaskUserRowId: $scope.searchFilters.clientKeyword.Client.RowId,
        				AssignedUserId: $scope.authInfo.userRowId,
        				ToyRowId: $scope.searchFilters.clientKeyword.UserToy.RowId,
        			};
        			searchTasks(userTaskSearchArgs);
        		}
        	};

        	function clearSearch() {
        		$scope.searchFilters.assignedUser = null;
        		$scope.searchFilters.assignedServiceTech = null;
        		$scope.searchFilters.completeDate = null;
        		$scope.searchFilters.completeUser = null;
        		$scope.searchFilters.createDate = null;
        		$scope.searchFilters.createUser = null;
        		$scope.searchFilters.lastModDate = null;
        		$scope.searchFilters.lastModUser = null;
        		$scope.searchFilters.requestedCompletionDate = null;
        		$scope.searchFilters.keyword = '';
        		$scope.searchFilters.clientKeyword = null;
        		if (!$scope.otherSupervisors.dontSearchOnClear) {
        			$scope.searchUserTasks();
        		}
        	};

        	function clearStatus() {
        		$scope.searchFilters.status = {
        			Text: 'All',
        			Value: -1
        		};
        		$scope.searchUserTasks();
        	};

        	$scope.searchReminders = function (filterStatus, refreshFromSave) {
        		var filter;
        		$scope.isRemindersLoading = true;
        		if (refreshFromSave) {
        			refreshRemindersInboxCounts();
        			filter = getFilter(filterStatus, true);
        			hydrateReminderActiveInbox(filter);
        		} else {
        			filter = getFilter(filterStatus, false);
        			var inbox = getActiveInbox();
        			if ((filter || 'all') == inbox) {
        				//we're on a reminder folder and need to refresh inboxes AND set the active results
        				if (filter == '') {
        					refreshRemindersInboxCounts(true);
        				} else {
        					refreshRemindersInboxCounts();
        					hydrateReminderActiveInbox(filter);
        				}
        			} else {
        				refreshRemindersInboxCounts();
        			}
        		}
        	};

        	$scope.inboxList = function (list) {
        		return list.ParentGroupRowId == null
					&& (list.IsFolder == null
						|| list.IsFolder == false)
        			&& list.TaskCount > 0;
        	};

        	$scope.greaterThan = function (prop, val) {
        		return function (item) {
        			return item[prop] > val;
        		}
        	}

        	$scope.toggleUserTaskGroup = function (userTaskGroup, toggle) {
        		//$scope.userTaskGroup.loadingComplete = false;
        		if ($scope.listOrTaskById.isTaskById) { return false; }
        		if (toggle !== 'ignore') userTaskGroup.open = !userTaskGroup.open;
        		if (toggle === 'ignore' && !userTaskGroup.open) userTaskGroup.open = true;
        		if (userTaskGroup.open) {
        			var userTaskSearchArgs = {
        				SearchType: 1, // search user tasks
        				TaskUserRowId: $routeParams.clientId ? $routeParams.clientId : authService.getAuthInfo().userRowId,
        				Keyword: $scope.searchFilters.keyword,
        				Status: $scope.searchFilters.status == null ? taskStatus.All : $scope.searchFilters.status.Value,
        				CreatedByUserId: $scope.searchFilters.createUser == null ? null : $scope.searchFilters.createUser.RowId,
        				LastModByUserId: $scope.searchFilters.lastModUser == null ? null : $scope.searchFilters.lastModUser.RowId,
        				AssignedUserId: $scope.searchFilters.assignedUser == null ? null : $scope.searchFilters.assignedUser.RowId,
        				AssignedServiceTechId: $scope.searchFilters.assignedServiceTech == null ? null : $scope.searchFilters.assignedServiceTech.RowId,
        				CompletedByUserId: $scope.searchFilters.completeUser == null ? null : $scope.searchFilters.completeUser.RowId,
        				CreateDate: $scope.searchFilters.createDate,
        				LastModDate: $scope.searchFilters.lastModDate,
        				RequestedCompletionDate: $scope.searchFilters.requestedCompletionDate,
        				CompleteDate: $scope.searchFilters.completeDate,
        				IsFiltersLoaded: $scope.isFiltersLoaded,
        				ToyRowId: $routeParams.toyId ? $routeParams.toyId : null,
        				TaskQueue: $scope.selectedTaskQueue ? $scope.selectedTaskQueue : null
        			};
        			if (userTaskGroup.IsFolder) {
        				var TaskCount = 0;
        				// get sub folders
        				return userTaskDataService.getGroupSubGroupsById(userTaskGroup.RowId, userTaskSearchArgs).then(function (result) {
        					$timeout(function () {
        						userTaskGroup.GroupSubGroups = result;
        						angular.forEach(result, function (group) {
        							TaskCount += group.TaskCount;
        						});
        						var lists = _.where($scope.userTasksGroupsList, { RowId: userTaskGroup.RowId });
        						if (lists.length == 1) {
        							lists[0].GroupSubGroups = result;
        						}
        						//userTaskGroup.loadingComplete = true;
        					});

        					// get user tasks for the folder/list
        					return userTaskDataService.getGroupUserTasksById(userTaskGroup.RowId, userTaskSearchArgs).then(function (userTasks) {
        						$timeout(function () {
        							userTaskGroup.GroupTasks = $filter('orderBy')(userTasks, 'SortOrder');
        							TaskCount += userTasks.length;
        							userTaskGroup.TaskCount = TaskCount;
        							var lists = _.where($scope.userTasksGroupsList, { RowId: userTaskGroup.RowId });
        							if (lists.length == 1) {
        								lists[0].GroupTasks = $filter('orderBy')(userTasks, 'SortOrder');
        								lists[0].TaskCount = TaskCount;
        							}
        							//userTaskGroup.loadingComplete = true;
        						});
        					});
        				});
        			}
        			else {
        				// get user tasks for the folder/list
        				return userTaskDataService.getGroupUserTasksById(userTaskGroup.RowId, userTaskSearchArgs).then(function (userTasks) {
        					$timeout(function () {
        						userTaskGroup.GroupTasks = $filter('orderBy')(userTasks, 'SortOrder');
        						var lists = _.where($scope.userTasksGroupsList, { RowId: userTaskGroup.RowId });
        						if (lists.length == 1) {
        							lists[0].GroupTasks = $filter('orderBy')(userTasks, 'SortOrder');
        						}
        						//userTaskGroup.loadingComplete = true;
        					});
        				});
        			}
        		}
        	};

        	var isActiveInboxReminder = function () {
        		var isReminder = false;
        		var inbox = getActiveInbox();
        		switch (inbox) {
        			case 'all':
        			case 'past due':
        			case "pastdue":
        			case 'upcoming':
        			case 'snoozed':
        				isReminder = true;
        				break;
        			default:
        				isReminder = false;
        		}
        		return isReminder;
        	};
        	var getActiveInbox = function () {
        		var inbox = '';
        		if ($scope.activePrimaryInbox) inbox = $scope.activePrimaryInbox.trim().toLowerCase();
        		if (inbox === "past due") inbox = "pastdue";
        		return inbox;
        	};
        	var hydrateReminderActiveInbox = function (filter) {
        		var filterPayload = { 'filterStatus': filter };
        		dataService.getAll('UserReminders', filterPayload, {}).then(function (result) {
        			$scope.reminders = result;
        			$scope.isRemindersLoading = false;
        		});
        	};
        	var hydrateReminderActiveInboxOnBehalfOfUserId = function (filter) {
        		if (!filter) {
        			filter = '';
        		}
        		dataService.getAll('userreminders/getonbehalfof/' + $routeParams.clientId + '/' + filter, {}, {}).then(function (result) {
        			$scope.reminders = result;
        			$scope.isRemindersLoading = false;
        		});
        	};
        	var getFilter = function (filterPassedIn, pullFromPrimaryInbox) {
        		var newFilterStatus = '';
        		var filter;
        		if (filterPassedIn) {
        			newFilterStatus = filterPassedIn.trim().toLowerCase();
        		} else if (!filterPassedIn && $scope.activePrimaryInbox && pullFromPrimaryInbox) {
        			newFilterStatus = $scope.activePrimaryInbox.trim().toLowerCase();
        		}
        		switch (newFilterStatus.toLowerCase().trim()) {
        			case 'all':
        				filter = '';
        				break;
        			case 'past due':
        			case 'pastdue':
        				filter = 'pastdue';
        				break;
        			case 'upcoming':
        				filter = 'upcoming';
        				break;
        			case 'snoozed':
        				filter = 'snoozed';
        				break;
        			default:
        				filter = '';
        		}
        		return filter;
        	};
        	var refreshRemindersInboxCounts = function (setResults) {
        		var filterPayload = { 'filterStatus': '' };
        		dataService.getAll('UserReminders', filterPayload, {}).then(function (result) {
        			setRemindersInbox(result);
        			if (setResults) {
        				$scope.reminders = result;
        				$scope.isRemindersLoading = false;
        			}
        		});
        	};
        	var refreshRemindersInboxCountsOnBehalfOfUserId = function (setResults) {
        		var filterStatus = '';
        		dataService.getAll('userreminders/getonbehalfof/' + $routeParams.clientId + '/' + filterStatus, {}, {}).then(function (result) {
        			setRemindersInbox(result);
        			if (setResults) {
        				$scope.reminders = result;
        				$scope.isRemindersLoading = false;
        			}
        		});
        	};
        	var setRemindersInbox = function (result) {
        		$scope.inboxLists = {
        			'All': result.length,
        			'Past Due': $filter('filter')(result, { Status: 'pastdue' }).length,
        			'Upcoming': $filter('filter')(result, { Status: 'upcoming' }).length,
        			'Snoozed': $filter('filter')(result, { Status: 'snoozed' }).length
        		};
        	};

        	$scope.searchRemindersOnBehalfOfUserId = function (filterStatus, refreshFromSave) {
        		var filter;
        		$scope.isRemindersLoading = true;
        		if (refreshFromSave) {
        			refreshRemindersInboxCountsOnBehalfOfUserId();
        			filter = getFilter(filterStatus, true);
        			hydrateReminderActiveInboxOnBehalfOfUserId(filter);
        		} else {
        			filter = getFilter(filterStatus, false);
        			var inbox = getActiveInbox();
        			if ((filter || 'all') == inbox) {
        				//we're on a reminder folder and need to refresh inboxes AND set the active results
        				if (filter == '') {
        					refreshRemindersInboxCountsOnBehalfOfUserId(true);
        				} else {
        					refreshRemindersInboxCountsOnBehalfOfUserId();
        					hydrateReminderActiveInboxOnBehalfOfUserId(filter);
        				}
        			} else {
        				refreshRemindersInboxCountsOnBehalfOfUserId();
        			}
        		}
        	};

        	$scope.saveReminder = function (reminder, index) {
        		var payload = {
        			"RowId": reminder.RowId,
        			"UserRowId": parseInt($scope.authInfo.userRowId),
        			"Title": reminder.Title,
        			"Description": reminder.Description,
        			"Templates": reminder.Templates,
        			"Frequencies": reminder.Frequencies,
        			"ToyRowId": reminder.ToyRowId,
        			"ToyEquipmentRowId": reminder.ToyEquipmentRowId,
        			"GuidelineRowId": null,
        			"GuidelineVersion": null,
        			"DueDate": reminder.DueDate
        		};
        		dataService.update('UserReminders', reminder.RowId, payload).then(function (result) {
        			toastr.success('Reminder has been saved.');
        			reminder = result;
        			$scope.reminders[index] = result;
        		});
        	};

        	$scope.deleteReminder = function (reminder) {
        		bootbox.confirm("Are you sure you want to delete the selected reminder?", function (result) {
        			if (result) {
        				dataService.remove('UserReminders', reminder.RowId).then(function (result) {
        					if (isBusinessPremium() && $routeParams.reminders && $routeParams.clientId) {
        						$scope.searchRemindersOnBehalfOfUserId();
        					} else {
        						$scope.searchReminders();
        					}
        					$scope.isRemindersLoading = false;
        				});
        			}
        		});
        	};

        	$scope.addStepToReminder = function (reminder, step) {
        		if (!reminder.Templates) reminder.Templates = [];
        		reminder.Templates.push(step);
        		reminder.newReminderStep = ""
        	};

        	var snoozeModalCtrl = ['$scope', '$modalInstance', function ($scope, $modalInstance) {
        		$scope.ok = function (result) {
        			$modalInstance.close($scope.dt.value);
        		};

        		$scope.cancel = function (result) {
        			$modalInstance.close('cancel');
        		};

        		$scope.today = function () {
        			$scope.dt = {
        				value: new Date()
        			};
        		};
        		$scope.today();

        		$scope.toggleMin = function () {
        			$scope.minDate = new Date();
        		};
        		$scope.toggleMin();

        		$scope.open = function ($event) {
        			$event.preventDefault();
        			$event.stopPropagation();

        			$scope.opened = {
        				value: true
        			};
        		};
        		$scope.initDate = new Date();
        		$scope.dateOptions = {
        			formatYear: 'yy',
        			startingDay: 1
        		};
        	}];

        	$scope.openSnoozeModal = function () {
        		return $modal.open({
        			templateUrl: 'snoozeDateModal.html',
        			controller: snoozeModalCtrl,
        			scope: $scope
        		}).result;
        	};

        	$scope.reminderSnooze = function (reminder) {
        		$scope.opened['ReminderActions'] = !$scope.opened['ReminderActions'];
        		reminder.snoozeItDate = new Date();
        		reminder.snoozeItDate.setDate(reminder.snoozeItDate.getDate() + 1);
        		$scope.openSnoozeModal().then(function (result) {
        			if (result && result != 'cancel') {
        				reminder.SnoozedUntilDate = result;
        				reminder.ActionKeyword = reminderActionKeywords.SnoozeIt;
        				dataService.update('UserReminders', reminder.RowId, reminder).then(function (result) {
        					$scope.isReminderOpen = false;
        					if (isBusinessPremium() && $routeParams.reminders && $routeParams.clientId) {
        						$scope.searchRemindersOnBehalfOfUserId(null, true);
        					} else {
        						$scope.searchReminders(null, true);
        					}
        					$scope.isRemindersLoading = false;
        				});
        			}
        		});
        	};

        	$scope.reminderUnsnooze = function (reminder) {
        		$scope.opened['ReminderActions'] = !$scope.opened['ReminderActions'];
        		reminder.ActionKeyword = reminderActionKeywords.UnSnoozeIt;
        		dataService.update('UserReminders', reminder.RowId, reminder).then(function (result) {
        			$scope.isReminderOpen = false;
        			if (isBusinessPremium() && $routeParams.reminders && $routeParams.clientId) {
        				$scope.searchRemindersOnBehalfOfUserId(null, true);
        			} else {
        				$scope.searchReminders(null, true);
        			}
        			$scope.isRemindersLoading = false;
        		});
        	};

        	$scope.reminderTaskIt = function (reminder) {
        		$scope.opened['ReminderActions'] = !$scope.opened['ReminderActions'];
        		var isCreatedOnBehalfOfClient = $routeParams.clientId ? true : false;
        		reminder.ActionKeyword = reminderActionKeywords.TaskIt;
        		dataService.update('UserReminders', reminder.RowId + '?actionKeyword=taskit&isCreatedOnBehalfOfClient=' + isCreatedOnBehalfOfClient, reminder).then(function (result) {
        			if (result && result.TaskListId) {
        				window.location = '/Tasker/#tasks?taskgroupid=' + result.TaskListId;
        			}
        		});
        	};

        	$scope.reminderDismiss = function (reminder) {
        		$scope.opened['ReminderActions'] = !$scope.opened['ReminderActions'];
        		reminder.ActionKeyword = reminderActionKeywords.DismissIt;
        		dataService.update('UserReminders', '', reminder).then(function (result) {
        			reminder = result;
        			if (isBusinessPremium() && $routeParams.reminders && $routeParams.clientId) {
        				$scope.searchRemindersOnBehalfOfUserId(null, true);
        			} else {
        				$scope.searchReminders(null, true);
        			}
        			$scope.isRemindersLoading = false;
        		});
        	};

        	function selectRemindersInbox(ind) {
        		$scope.activePrimaryQueue = null;
        		$scope.activePrimaryInbox = ind;
        		var statusText, filterValue;
        		switch (ind) {
        			case 'all':
        			case 'All':
        				statusText = 'All';
        				filterValue = 'all';
        				break;
        			case 'pastdue':
        			case 'past due':
        			case 'Past Due':
        				statusText = 'Past Due';
        				filterValue = 'pastdue';
        				break;
        			case 'upcoming':
        			case 'Upcoming':
        				statusText = 'Upcoming';
        				filterValue = 'upcoming';
        				break;
        			case 'snoozed':
        			case 'Snoozed':
        				statusText = 'Snoozed';
        				filterValue = 'snoozed';
        				break;
        		}

        		if (isBusinessPremium() && $routeParams.reminders && $routeParams.clientId) {
        			$scope.searchRemindersOnBehalfOfUserId(filterValue);
        		} else {
        			$scope.searchReminders(filterValue);
        		}
        	};

        	function selectUserTaskQueue(ind) {
        		if (ind == $scope.activePrimaryQueue) return;
        		var isSupervisorQueue = $scope.otherSupervisors.isOtherSupervisorsQueue;
        		$scope.otherSupervisors.isOtherSupervisorsQueue = ind == taskQueue.OtherSupervisor;
        		if ($scope.otherSupervisors.isOtherSupervisorsQueue) {
        			$scope.activePrimaryQueue = ind;
        			$scope.otherSupervisors.dontSearchOnClear = true;
        			clearSearch();
        			$scope.otherSupervisors.dontSearchOnClear = false;
        			getOtherSupervisors();
        		}
        		else {
        			if (isSupervisorQueue) {
        				$scope.otherSupervisors.dontSearchOnClear = true;
        				clearSearch();
        				$scope.otherSupervisors.dontSearchOnClear = false;
        			}
        			$scope.otherSupervisors.supervisorsList = [];
        			$scope.isVisible.isSpinner = true;
        			$scope.isQueue = true;
        			$timeout(function () {
        				$scope.activePrimaryInbox = null;
        				if ($scope.taskLists.selectedTasksList.RowId !== 0) {
        					$scope.activePrimaryQueue = ind;
        				} else {
        					$scope.taskLists.selectedTasksList.Title = "Inbox";
        					$scope.activePrimaryQueue = ind;
        				}
        			});
        		}
        	};

        	$scope.$watch('activePrimaryQueue', function () {
        		$scope.selectedTaskQueue = parseInt($scope.activePrimaryQueue);
        		$scope.otherSupervisors.selectedSupervisorId = null;
        		$scope.listOrTaskById = {
        			isTaskById: false,
        			taskId: 0,
        			isListById: false,
        			listId: 0,
        			listOrTaskByIdTasks: {},
        			dontSearchOnClear: false,
        		};
        		if ($scope.otherSupervisors.isOtherSupervisorsQueue) { return; }
        		if (!$routeParams.clientSearch && !$routeParams.toySearch && $scope.activePrimaryQueue != -1) {
        			$scope.searchUserTasks();
        		} else {
        			$scope.searchClientTasks();
        		}
        	});

        	$scope.setAsDefault = function (index) {
        		$scope.activePrimaryQueue = index;
        		$cookieStore.put('task-queue', $scope.activePrimaryQueue);
        	};

        	function getOtherSupervisors() {
        		userTasksUserXrefDataService.getOtherSupervisors($scope.authInfo.userRowId).then(function (results) {
        			$scope.otherSupervisors.supervisorsList = results;
        			$scope.otherSupervisors.supervisorTasks = [];
        			$scope.otherSupervisors.selectedSupervisorName = '';
        		});
        	};

        	function getSupervisorTasks(userId, displayName) {
        		$scope.otherSupervisors.selectedSupervisorId = userId;
        		$scope.otherSupervisors.selectedSupervisorName = displayName;
        		var userTaskSearchArgs = {
        			SearchType: $scope.otherSupervisors.supervisorSearchType,
        			AssignedUserId: userId,
        			Keyword: $scope.searchFilters.keyword,
        			TaskUserRowId: $scope.searchFilters.clientKeyword == null ? null : $scope.searchFilters.clientKeyword.Client.RowId,
        			Status: $scope.searchFilters.status == null ? taskStatus.All : $scope.searchFilters.status.Value,
        			AssignedServiceTechId: $scope.searchFilters.assignedServiceTech == null ? null : $scope.searchFilters.assignedServiceTech.RowId,
        			ToyRowId: $scope.searchFilters.clientKeyword == null ? null : $scope.searchFilters.clientKeyword.UserToy.RowId,
        			TaskQueue: taskQueue.Open,
        			IsShowReassigned: $scope.otherSupervisors.isShowReassignedTasks,
        			ViewingUserId: $scope.authInfo.userRowId,
        		};
        		$scope.otherSupervisors.supervisorTasks = [];
        		userTaskDataService.getSupervisorTasks(userTaskSearchArgs).then(function (results) {
        			$scope.otherSupervisors.supervisorTasks = results;
        		});
        	};

        	$rootScope.$on('setSelectedList', function (event, args) {
        		$scope.isQueue = false;
        		$scope.listOrTaskById = {
        			isTaskById: false,
        			taskId: 0,
        			isListById: false,
        			listId: 0,
        			listOrTaskByIdTasks: {},
        			dontSearchOnClear: false,
        		};
        		$scope.setSelectList(args.list, args.context);
        	});

        	$scope.setSelectList = function (selectList, context) {
        		var list;
        		if (selectList) {
        			var lists = _.where($scope.userTasksGroupsList, { RowId: selectList.RowId });
        			list = lists[0];

        			if (list) {
        				$scope.taskLists.selectedTasksList = list;
        				angular.forEach($scope.userTasksGroupsList, function (folder) {
        					folder.IsActive = folder === list;
        					if (folder.GroupSubGroups && folder.GroupSubGroups.length > 0) {
        						angular.forEach(folder.GroupSubGroups, function (subgroup) {
        							subgroup.IsActive = subgroup == list;
        						});
        					}
        				});
        			} else {
        				$scope.taskLists.selectedTasksList = selectList;
        			}

        			$timeout(function () {
        				$scope.activePrimaryInbox = null;
        				$scope.taskLists.isLoading = true;
        			});
        			$scope.individualTasksList.IsActive = false;
        			$scope.sharedTasksList.IsActive = false;

        			$timeout(function () {
        				$scope.taskLists.isLoading = false;
        				$scope.taskLists.selectedTasksList.open = false;
        				$scope.toggleUserTaskGroup($scope.taskLists.selectedTasksList).then(function () {
        					$timeout(function () {
        						$scope.taskLists.selectedTasksList.TaskCount = $scope.taskLists.selectedTasksList.GroupTasks ? $scope.taskLists.selectedTasksList.GroupTasks.length : 0;
        						if ($scope.taskLists.selectedTasksList.IsFolder) {
        							angular.forEach($scope.taskLists.selectedTasksList.GroupSubGroups, function (subgroup) {
        								$scope.taskLists.selectedTasksList.TaskCount += subgroup.TaskCount;
        							});
        						}
        						// set myFolder / groupId query params so subsequent
        						// refreshes take us back here and so we can track
        						// where we are in the UI
        						$location.search('myFolder', $scope.taskLists.selectedTasksList.Title)
        						$location.search('groupId', $scope.taskLists.selectedTasksList.RowId)
        					});
        				});
        			}, 1000);
        		}
        	};

        	$scope.scrollToElement = function (element, isGroup) {
        		// temporarily disabling while we assess UX
        		//return;
        		var checkForParent
                    , checkForElement
                    , topOffset
                    , elm = null
                    , elmParent = null
                    , elementToggleBtn = null
                    , elementParentToggleBtn = null
        		;

        		function continueHandler() {
        			clearInterval(checkForParent);
        			checkForElement = setInterval(function () {
        				if (!isGroup) {
        					elm = $('#task-' + element.RowId)
        					elementToggleBtn = $('#task-' + element.RowId + ' .task-icons i.glyphicon-chevron-down')
        				}
        				else {
        					elm = $('#task-group-' + element.RowId)
        					elementToggleBtn = $('#task-group-' + element.RowId + ' i.toggle-btn.glyphicon-chevron-right')
        				}
        				if (elm && elm.length > 0) {
        					clearInterval(checkForElement);
        					if (!elm.offset()) return;

        					$timeout(function () {
        						topOffset = elm.offset().top
        						if (elementToggleBtn && elementToggleBtn.length > 0) elementToggleBtn.click()
        						$('body').scrollTop(topOffset)
        						/*$('body').animate({ scrollTop: topOffset }, 2000, "swing", function () {
        	                        elm = null
        	                        element = null
        	                        elementToggleBtn = null
        	                        topOffset = null
        	                    })*/
        					})
        				}
        			}, 500);
        		}

        		checkForParent = setInterval(function () {
        			if (element.ParentGroupRowId) {
        				// list is in a folder
        				elmParent = $('#task-group-' + element.ParentGroupRowId)
        				elementParentToggleBtn = $('#task-group-' + element.ParentGroupRowId + ' i.toggle-btn.glyphicon-chevron-right')

        				$timeout(function () {
        					if (elementParentToggleBtn && elementParentToggleBtn.length > 0) elementParentToggleBtn.click()
        				})
        			} else {
        				continueHandler()
        			}

        			if (elmParent && elmParent.length > 0) continueHandler()
        		}, 400)
        	};

        	$rootScope.$on('group.created', function (e, data) {
        		if (data.list) {
        			var scrolling = false;
        			// Note: We need to wait until the 'searchUserTasks' function
        			// fires the tasksLoaded event... otherwise, the DOM element
        			// won't be ready yet (ie. not visible)
        			$scope.$on('event:tasksLoaded', function () {
        				if (!scrolling) {
        					$scope.scrollToElement(data.list, true)
        					scrolling = true;
        				}
        			})
        		}
        	});

        	var newUserTaskAddedTimeout;
        	function newUserTaskAdded(newUserTask) {
        		//clearTimeout(newUserTaskAddedTimeout);
        		//newUserTaskAddedTimeout = setTimeout(function () {
        		// clear search if any search filters have been applied before
        		// creating our new task
        		if ($scope.searchFilters.assignedServiceTech ||
                    $scope.searchFilters.assignedUser ||
                    $scope.searchFilters.clientKeyword ||
                    $scope.searchFilters.completeDate ||
                    $scope.searchFilters.completeUser ||
                    $scope.searchFilters.createDate ||
                    $scope.searchFilters.createUser ||
                    $scope.searchFilters.keyword !== '' ||
                    $scope.searchFilters.lastModDate ||
                    $scope.searchFilters.lastModUser ||
                    $scope.searchFilters.requestedCompletionDate) {
        			$scope.clearSearch();
        		}
        		if (($scope.activePrimaryInbox != taskQueue.All) || ($scope.activePrimaryInbox != taskQueue.Open)) {
        			$scope.selectUserTaskQueue(taskQueue.Open);
        		};
        		if ($scope.isQueue) {
        			$scope.individualTasksList.GroupTasks.unshift(newUserTask);
        			$scope.individualTasksList.TaskCount++;
        			if (!$scope.individualTasksList.open) {
        				$scope.individualTasksList.open = true;
        			}
        			$scope.scrollToElement(newUserTask);
        		}
        		else {
        			var userTaskGroupXref = {
        				UserTaskRowId: newUserTask.RowId,
        				UserTaskGroupRowId: $scope.taskLists.selectedTasksList.RowId
        			};
        			$scope.toggleUserTaskGroupAssignment(userTaskGroupXref).then(function () {
        				if (newUserTask.UserTaskGroupRowId !== $scope.taskLists.selectedTasksList.RowId) newUserTask.UserTaskGroupRowId = $scope.taskLists.selectedTasksList.RowId
        				$scope.taskLists.selectedTasksList.GroupTasks.unshift(newUserTask);
        				$scope.taskLists.selectedTasksList.TaskCount++;

        				$scope.scrollToElement(newUserTask);
        			});
        		}
        		//}, 600);
        	};

        	$scope.setFocus = function (userTaskGroupRowId) {
        		if (userTaskGroupRowId) {
        			$timeout(function () {
        				window.jQuery('#addtask_' + userTaskGroupRowId).focus();
        			});
        		}
        	};

        	var addUserTaskFromTaskListTimeout;
        	function addUserTaskFromTaskList(userTask, userTaskGroup) {
        		clearTimeout(addUserTaskFromTaskListTimeout);
        		addUserTaskFromTaskListTimeout = setTimeout(function () {
        			if (userTask.Title == '') { return false; }
        			var newTask;
        			userTask.UserRowId = authService.getAuthInfo().userRowId;
        			userTask.Status = taskStatus.NotAssigned;
        			userTask.IsStatusChange = true;
        			userTaskDataService.save(userTask).then(function (result) {
        				newTask = result;
        				if (newTask.RowId) {
        					if (userTaskGroup == $scope.individualTasksList) {
        						$scope.addingTask['individualTasksList'] = !$scope.addingTask['individualTasksList'];
        						if (userTaskGroup.open) {
        							// insert task
        							userTaskGroup.GroupTasks.unshift(newTask);
        							$scope.individualTasksList.TaskCount++;
        						}
        						else {
        							userTaskGroup.open = true;
        						}
        						$scope.scrollToElement(newTask);
        					} else {
        						var userTaskGroupXref = {
        							UserTaskRowId: newTask.RowId,
        							UserTaskGroupRowId: userTaskGroup.RowId
        						};
        						$scope.toggleUserTaskGroupAssignment(userTaskGroupXref).then(function (result) {
        							if (newTask.UserTaskGroupRowId !== userTaskGroup.RowId) newTask.UserTaskGroupRowId = userTaskGroup.RowId
        							$scope.addingTask[userTaskGroup.RowId] = !$scope.addingTask[userTaskGroup.RowId];
        							// increment task count
        							userTaskGroup.TaskCount++;
        							$scope.scrollToElement(newTask);
        							if (userTaskGroup.open) {
        								// insert task
        								try {
        									userTaskGroup.GroupTasks.unshift(newTask);
        									if (userTaskGroup.ParentGroupRowId == null && (userTaskGroup.IsFolder == null || userTaskGroup.IsFolder == false)) {
        										// increment parent 'Inbox' count
        										$scope.individualTasksList.TaskCount++;
        									}
        								} catch (e) { }
        							}
        							else {
        								$scope.toggleUserTaskGroup(userTaskGroup);
        							}
        							// check if a list is a child for the folder
        							if (userTaskGroup.ParentGroupRowId) {
        								// find and increment parent task count
        								var lists = _.where($scope.userTasksGroupsList, { RowId: userTaskGroup.ParentGroupRowId });
        								var list = lists[0];
        								list.TaskCount++;
        							}
        						});
        					}
        					userTask.Title = '';
        					toastr.success('Task has been added.');
        				}
        			});
        		}, 600);
        	};

        	var newUserTaskFromTaskListAddedTimeout;
        	function newUserTaskFromTaskListAdded(newUserTask, userTaskGroup) {
        		//clearTimeout(newUserTaskFromTaskListAddedTimeout);
        		//newUserTaskFromTaskListAddedTimeout = setTimeout(function () {
        		if (newUserTask.RowId) {
        			if (userTaskGroup == $scope.individualTasksList) {
        				$scope.addingTask['individualTasksList'] = !$scope.addingTask['individualTasksList'];
        				if (userTaskGroup.open) {
        					// insert task
        					userTaskGroup.GroupTasks.unshift(newUserTask);
        					$scope.individualTasksList.TaskCount++;
        				}
        				else {
        					userTaskGroup.open = true;
        				}
        				$scope.scrollToElement(newUserTask);
        			} else {
        				var userTaskGroupXref = {
        					UserTaskRowId: newUserTask.RowId,
        					UserTaskGroupRowId: userTaskGroup.RowId
        				};
        				$scope.toggleUserTaskGroupAssignment(userTaskGroupXref).then(function (result) {
        					if (newUserTask.UserTaskGroupRowId !== userTaskGroup.RowId) newUserTask.UserTaskGroupRowId = userTaskGroup.RowId
        					if (userTaskGroup.WorkOrderId !== null) {
        						$scope.addingOpCode[userTaskGroup.RowId] = !$scope.addingOpCode[userTaskGroup.RowId];
        					} else {
        						$scope.addingTask[userTaskGroup.RowId] = !$scope.addingTask[userTaskGroup.RowId];
        					}
        					// increment task count
        					userTaskGroup.TaskCount++;
        					$scope.scrollToElement(newUserTask);
        					if (userTaskGroup.open) {
        						// insert task
        						try {
        							userTaskGroup.GroupTasks.unshift(newUserTask);
        							if (userTaskGroup.ParentGroupRowId == null && (userTaskGroup.IsFolder == null || userTaskGroup.IsFolder == false)) {
        								// increment parent 'Inbox' count
        								$scope.individualTasksList.TaskCount++;
        							}
        						} catch (e) { }
        					}
        					else {
        						$scope.toggleUserTaskGroup(userTaskGroup);
        					}
        					// check if a list is a child for the folder
        					if (userTaskGroup.ParentGroupRowId) {
        						// find and increment parent task count
        						var lists = _.where($scope.userTasksGroupsList, { RowId: userTaskGroup.ParentGroupRowId });
        						var list = lists[0];
        						list.TaskCount++;
        					}
        				});
        			}
        		}
        		//}, 600);
        	};

        	function updateUserTaskGroup(userTaskGroup, title) {
        		if (!userTaskGroup.UserRowId) {
        			userTaskGroup.UserRowId = userRowId;
        		}
        		if (!userTaskGroup.Title && userTaskGroup.selectedTasksListTitle) {
        			userTaskGroup.Title = userTaskGroup.selectedTasksListTitle;
        		}
        		if (!userTaskGroup.RowId && userTaskGroup.selectedTasksList) {
        			userTaskGroup.RowId = userTaskGroup.selectedTasksList[0].UserTaskGroupRowId;
        		}
        		userTaskGroup.Title = title;
        		userTaskGroup.IsActive = null;
        		dataService.update('UserTaskGroup', userTaskGroup.RowId, userTaskGroup).then(function (result) {
        			var list = _.where($scope.userTasksGroupsList, { RowId: userTaskGroup.RowId });
        			if (list != null && list.length > 0) {
        				list[0].Title = title;
        			}
        			$rootScope.$broadcast('event:taskGroupNameChange', { userTaskGroup: userTaskGroup });
        			toastr.success('Task Group Name has been changed.');
        		});
        	};

        	function suggestClient(searchKeyword) {
        		return userTaskDataService.getSuggestedClients(searchKeyword).then(function (results) {
        			return results;
        		});
        	};

        	function suggestContact(searchKeyword) {
        		return userTaskDataService.getSuggestedContacts(searchKeyword).then(function (results) {
        			return results;
        		});
        	};

        	function suggestServiceProviders(searchKeyword) {
        		return userTaskDataService.getSuggestedServiceProviders(searchKeyword).then(function (results) {
        			return results;
        		});
        	};

        	function today() {
        		return new Date();
        	};

        	$scope.$watch('[searchFilters.createDate,searchFilters.lastModDate,searchFilters.requestedCompletionDate,searchFilters.completeDate]', function () {
        		if (!$scope.clientTasks.isClientTasksLoaded && !($routeParams.myFolder || $routeParams.groupId || $routeParams.taskId)) {
        			$scope.searchUserTasks();
        			$scope.clientTasks.isClientTasksLoaded = false;
        		}
        	});

        	function toggleUserTaskGroupAssignment(userTaskGroupXref) {
        		return dataService.add('UserTaskGroupXref', userTaskGroupXref).then(function (result) {
        			if (result) {
        				angular.forEach($scope.individualTasksList.GroupTasks, function (task, index) {
        					if (task.RowId == userTaskGroupXref.UserTaskRowId) {
        						$scope.individualTasksList.GroupTasks.splice(index, 1);
        						$scope.individualTasksList.TaskCount--;
        						$scope.individualTasksList.TaskCount--;
        					}
        				});
        				// add task to the list in ui
        				var lists = fn($scope.userTasksGroupsList, userTaskGroupXref.UserTaskGroupRowId);
        				if (lists && lists.length > 0) {
        					var list = lists[0];
        					if (list.open) {
        						var tasks;
        						angular.forEach($scope.individualTasksList.GroupTasks, function (task, index) {
        							if (task.RowId == userTaskGroupXref.UserTaskRowId) {
        								if (list.GroupTasks.indexOf(task) === -1)
        									list.GroupTasks.push(task);
        								list.TaskCount++;
        							}
        						});
        						angular.forEach($scope.userTasksGroupsList, function (folder) {
        							angular.forEach(folder.GroupTasks, function (task, index) {
        								if (task.RowId == userTaskGroupXref.UserTaskRowId) {
        									if (list.GroupTasks.indexOf(task) === -1)
        										list.GroupTasks.push(task);
        									list.TaskCount++;
        								}
        							});
        						});
        						$scope.toggleUserTaskGroup(list, 'ignore'); // ignore toggle
        					}
        					else {
        						$scope.toggleUserTaskGroup(list);
        					}
        				}
        				toastr.success('Task has been assigned to list');
        			}
        		}, function (error) {
        			console.log('err', error)
        			toastr.error(error.Message);
        		});
        	};

        	function unlinkTaskFromGroup(userTask) {
        		if (userTask.UserTaskGroupXrefRowId) {
        			return dataService.remove('UserTaskGroupXref', userTask.UserTaskGroupXrefRowId).then(function (result) {
        				// remove task from the list in ui
        				angular.forEach($scope.individualTasksList.GroupTasks, function (task, index) {
        					if (task.RowId == userTask.RowId) {
        						$scope.individualTasksList.GroupTasks.splice(index, 1);
        						$scope.individualTasksList.TaskCount--;
        						$scope.individualTasksList.TaskCount--;
        					}
        				});
        				userTask.UserTaskGroupXrefRowId = null;
        				$scope.individualTasksList.GroupTasks.push(userTask);
        				$scope.individualTasksList.GroupTasks = $filter('orderBy')($scope.individualTasksList.GroupTasks, 'SortOrder')
        				angular.forEach($scope.userTasksGroupsList, function (folder) {
        					angular.forEach(folder.GroupTasks, function (task, index) {
        						if (task.RowId == userTask.RowId) {
        							if (folder.open) {
        								folder.GroupTasks.splice(index, 1);
        								folder.TaskCount--;
        								if (!folder.ParentGroupRowId) { $scope.individualTasksList.TaskCount--; }
        							}
        							else {
        								$scope.toggleUserTaskGroup(folder);
        							}
        						}
        					});
        				});
        				toastr.success('Task unlinked from Group');
        			}, function (error) {
        				toastr.error(error.Message);
        			});
        		}
        		else {
        			// remove task from the list in ui
        			console.log('removing from ui only');
        			angular.forEach($scope.individualTasksList.GroupTasks, function (task, index) {
        				if (task.RowId == userTask.RowId) {
        					$scope.individualTasksList.GroupTasks.splice(index, 1);
        					$scope.individualTasksList.TaskCount--;
        					$scope.individualTasksList.TaskCount--;
        				}
        			});
        			angular.forEach($scope.userTasksGroupsList, function (folder) {
        				angular.forEach(folder.GroupTasks, function (task, index) {
        					if (task.RowId == userTask.RowId) {
        						folder.GroupTasks.splice(index, 1);
        						folder.TaskCount--;
        						if (!folder.ParentGroupRowId) { $scope.individualTasksList.TaskCount--; }
        					}
        				});
        			});
        			return true;
        		}
        	};

        	function openDatepicker($event, elementOpened) {
        		$event.preventDefault();
        		$event.stopPropagation();
        		$scope.opened[elementOpened] = !$scope.opened[elementOpened];
        	};

        	function isPermission(ctrl, taskType, clientId) {
        		var permission = false;
        		var clientPermissions = _.where($scope.authInfo.userPermissions, { OwnerRowId: clientId });
        		var permissionsList = clientPermissions.length == 1 ? clientPermissions[0].TaskerPermissions : [];
        		switch (ctrl) {
        			case 'CreateTask':
        				permission = $scope.authInfo.userCategory == 'BusinessFree' || $scope.authInfo.userCategory == 'BusinessPremium';
        				break;
        			case 'LinkedMedia':
        				if (taskType == 'UserTask' || $scope.authInfo.userCategory == 'BusinessFree' || (taskType == 'ClientTask' && $scope.authInfo.userCategory == 'BusinessPremium')) {
        					permission = true;
        				}
        				break;
        		}
        		return permission;
        	};

        	function isPremiumFeature(taskType) {
        		var premium = false;
        		if (taskType == 'ClientTask' && $scope.authInfo.userCategory == 'BusinessFree') {
        			toastr.error('This is a Premium feature available with Business Pro subscription');
        			premium = true;
        		}
        		return premium;
        	};

        	function isBusinessPremium() {
        		var premium = $scope.authInfo.userCategory == 'BusinessPremium';
        		return premium;
        	};

        	function expandCollapse(panel) {
        		var element;
        		switch (panel) {
        			case 'search':
        				$scope.isCollapsed.search = !$scope.isCollapsed.search;
        				if (!$scope.isCollapsed.search) {
        					if ($scope.authInfo.userCategory == 'BusinessPremium') {
        						element = $("#searchClients");
        					}
        					else {
        						element = $("#searchTasks");
        					}
        					$timeout(function () {
        						element.focus();
        					});
        				}
        				break;
        		}
        	};

        	function assignUser(data) {
        		if (typeof data === 'object') {
        			$scope.taskPost.AssignedUserRowId = data.AssignedUserRowId;
        			$scope.taskPost.TypeaheadDisplay = data.TypeaheadDisplay;
        		}
        		else {
        			toastr.error('Please select user from the list');
        		}
        	}

        	$scope.$on('TaskSelectionChange', function (evt, args) {
        		// determine the list task belongs to
        		var lists = _.where($scope.userTasksGroupsList, { RowId: args.userTask.UserTaskGroupRowId });
        		var taskList;
        		if (lists.length > 0) {
        			taskList = args.userTask.UserTaskGroupRowId == $scope.taskLists.selectedTasksList.RowId ? $scope.taskLists.selectedTasksList : lists[0];
        		}
        		else if (args.userTaskGroup) {
        			// use userTaskGroup from event args attached to tk-user-task directive
        			taskList = args.userTaskGroup;
        		}
        		else {
        			taskList = $scope.individualTasksList;
        		}
        		// check for parent folder
        		if (taskList.ParentGroupRowId) {
        			lists = _.where($scope.userTasksGroupsList, { RowId: taskList.ParentGroupRowId });
        			if (lists.length > 0) {
        				var parent = lists[0];
        				var children = _.where(parent.GroupSubGroups, { RowId: taskList.RowId });
        				if (children.length > 0) {
        					taskList = children[0];
        				}
        			}
        		}
        		if (!taskList.numSelected) {
        			taskList.numSelected = 0;
        		}
        		if (args.userTask.Selected) {
        			taskList.numSelected++;
        		} else {
        			taskList.numSelected--;
        		}
        	});

        	function isEligibleBulkTasks(taskList) {
        		if (!taskList || !taskList.open) { return false; }
        		var numEligible = 0;
        		angular.forEach(taskList.GroupTasks, function (task) {
        			if ((task.TaskTypeToken == 'UserTask' || task.TaskTypeToken == 'ClientTask')
						&& task.CurrentTaskStatus != taskStatus.Completed
						&& task.CurrentTaskStatus != taskStatus.Cancelled) {
        				numEligible++;
        			};
        		});
        		return numEligible > 1;
        	};

        	function toggleSelectedTaskList(taskList) {
        		taskList.numSelected = 0;
        		angular.forEach(taskList.GroupTasks, function (task) {
        			task.Selected = (task.TaskTypeToken == 'UserTask' || task.TaskTypeToken == 'ClientTask')
						&& task.CurrentTaskStatus != taskStatus.Completed
						&& task.CurrentTaskStatus != taskStatus.Cancelled
        				&& taskList.selectAllTasks;
        			if (task.Selected) {
        				taskList.numSelected++;
        			};
        		});
        		taskList.isBulkActionsOpen = false;
        	};

        	function createLinkedList(taskListXref) {
        		var childList = {
        			Title: taskListXref.Title,
        			UserRowId: taskListXref.UserRowId,
        			LinkedListParentId: taskListXref.ParentListRowId,
        			LinkedListTypeId: taskListXref.LinkedListTypeId,
        			IsLinkedList: true,
        		}
        		return dataService.add('UserTaskGroup', childList).then(function (result) {
        			if (!result.IsLinkedList) {
        				taskListXref.ChildListRowId = result.RowId;
        				// for supervisor list build provider list linking back to owner's list
        				if (taskListXref.LinkedListTypeId == linkedListType.SupervisorList) {
        					taskListXref.ParentListRowId = result.LinkedListParentId;
        					taskListXref.LinkedListTypeId = linkedListType.ProviderList;
        				}
        				dataService.add('TaskListXref', taskListXref);
        			}
        			return result.RowId;
        		});
        	};

        	function gotoHome() {
        		$location.search('myFolder', null);
        		$scope.taskLists.selectedTasksList = [];

        		$timeout(function () {
        			searchUserTasks();
        		}, 1000);
        	};

        	function getListMessages(userTaskGroup) {
        		var searchArgs = {
        			ParentRowId: userTaskGroup.RowId,
        			ParentType: 2, // list messages
        		};
        		$scope.$broadcast('loadMessages', searchArgs);
        		userTaskGroup.isMessagesOpen = !userTaskGroup.isMessagesOpen;
        	};

        	$scope.$on('messagesLength', function (e, args) {
        		if (args.ParentType == 2) {
        			var lists = null;
        			if ($scope.otherSupervisors.isOtherSupervisorsQueue) {
        				angular.forEach($scope.otherSupervisors.supervisorTasks.UserTaskFoldersList, function (group) {
        					if (!lists || lists.length == 0 && group.GroupSubGroups && group.GroupSubGroups.length > 0) {
        						lists = _.where(group.GroupSubGroups, { RowId: args.ParentRowId });
        					}
        				});
        			}
        			else {
        				lists = _.where($scope.userTasksGroupsList, { RowId: args.ParentRowId });
        			}
        			if (lists && lists.length > 0) {
        				lists[0].MessagesCount = args.MessagesCount;
        			}
        		}
        	});

        	$scope.onUserTaskDragComplete = function (data, event) {
        		console.log(data);
        		console.log(event);
        		/*var userTaskGroupXref = {
					UserTaskRowId: source.RowId,
					UserTaskGroupRowId: destination.RowId
				};
				$scope.toggleUserTaskGroupAssignment(userTaskGroupXref);*/
        	};

        	// helper function to traverse search objects within object/array
        	function fn(obj, key) {
        		if (_.contains(obj, key)) {
        			return [obj];
        		}

        		var res = [];
        		_.forEach(obj, function (v) {
        			if (typeof v === 'object' && (v = fn(v, key)).length) {
        				res.push.apply(res, v);
        				return v;
        			}
        		});
        		return res;
        	}

        	$scope.cleanupMovedTasks = function (source, sourceGroupRowId) {
        		var elementPos, list, lists;
        		if (!sourceGroupRowId) {
        			list = $scope.individualTasksList;
        			elementPos = list['GroupTasks'].map(function (x) { return x.RowId; }).indexOf(source.RowId);
        			list['GroupTasks'].splice(elementPos, 1);
        			if (list.TaskCount) list.TaskCount--;
        			else $scope.individualTasksList.TaskCount--;
        		} else {
        			lists = _.filter(fn($scope.userTasksGroupsList, sourceGroupRowId), function (g) { return g.GroupTasks || g.IsFolder });
        			if (lists && lists.length > 0) {
        				list = lists[0];
        				elementPos = list['GroupTasks'].map(function (x) { return x.RowId; }).indexOf(source.RowId);
        				list['GroupTasks'].splice(elementPos, 1);
        				list.TaskCount--;
        				if (!list.ParentGroupRowId) $scope.individualTasksList.TaskCount--; // list inside the inbox
        			}
        		}
        	};

        	$scope.onDropComplete = function (data, destination) {
        		if ($scope.isSorting || !destination.Title) {
        			return false;
        		}

        		var source = data.userTask ? data.userTask : data; // tertiary statement to pick up both lists and tasks
        		var sourceGroupRowId = data.userTaskGroup
        		    , sourceGroup
        		;

        		if (!sourceGroupRowId) {
        			sourceGroup = $scope.individualTasksList
        		}
        		else {
        			sourceGroup = _.filter(fn($scope.userTasksGroupsList, sourceGroupRowId), function (g) { return g.GroupTasks || g.IsFolder })[0]
        		}

        		if (source == undefined) { return false; }
        		if (source.UserTaskGroupRowId && source.UserTaskGroupRowId === destination.RowId) { return; }

        		if (source.UserTaskGroupRowId && destination.RowId == 0) { // Unbind task
        			// remove from old list / folder in UI
        			$timeout(function () {
        				$scope.cleanupMovedTasks(source, sourceGroupRowId);
        			});

        			userTaskDataService.removeGroupUserTasksById(source.UserTaskGroupRowId, source.RowId).then(function (result) {
        				toastr.success('Task has been unbound');
        				try {
        					$scope.individualTasksList.TaskCount++
        					destination.GroupTasks.push(source)
        					$scope.individualTasksList.TaskCount++
        				} catch (e) {
        					$scope.searchUserTasks();
        				}
        			}, function (error) {
        				toastr.error(error);
        			});
        		} else if (source.ParentGroupRowId && destination.RowId == 0) { // Unbind list
        			source.ParentGroupRowId = null;
        			dataService.update('UserTaskGroup', source.RowId, source).then(function (result) {
        				toastr.success('List has been unbound from parent');
        				try {
        					destination.GroupSubGroups.push(result)
        					if (result.TaskCount > 0) destination.TaskCount = (destination.TaskCount + result.TaskCount)

        					if (sourceGroup.RowId !== 0) sourceGroup.TaskCount = (sourceGroup.TaskCount - result.TaskCount)
        					else $scope.individualTasksList.TaskCount = ($scope.individualTasksList.TaskCount - result.TaskCount)
        				} catch (e) {
        					$scope.searchUserTasks();
        				}
        			}, function (error) {
        				toastr.error(error.Message);
        			});
        		} else if (!source.IsFolder && destination.IsFolder) { // List/Task -> Folder
        			if (!source.TaskTypeToken) {
        				source.ParentGroupRowId = destination.RowId;
        				dataService.update('UserTaskGroup', source.RowId, source).then(function (result) {
        					toastr.success('List has been added as child');
        					try {
        						destination.GroupSubGroups.push(result)
        						if (result.TaskCount > 0) destination.TaskCount = (destination.TaskCount + result.TaskCount)

        						if (sourceGroup.RowId !== 0) sourceGroup.TaskCount = (sourceGroup.TaskCount - result.TaskCount)
        						else $scope.individualTasksList.TaskCount = ($scope.individualTasksList.TaskCount - result.TaskCount)
        					} catch (e) {
        						$scope.searchUserTasks();
        					}
        				}, function (error) {
        					toastr.error(error.Message);
        				});
        			} else {
        				if ((source.TaskTypeToken != 'SharedTask' && destination.Title == 'Shared With Me') ||
							(source.TaskTypeToken == 'SharedTask' && destination.Title == 'Inbox')) {
        					toastr.error('Not allowed');
        					return false;
        				}
        				var userTaskGroupXref = {
        					UserTaskRowId: source.RowId,
        					UserTaskGroupRowId: destination.RowId
        				};
        				// remove from old list / folder in UI
        				$timeout(function () {
        					$scope.cleanupMovedTasks(source, sourceGroupRowId);
        				});
        				try {
        					source.UserTaskGroupRowId = destination.RowId
        					destination.GroupTasks.push(source)
        					destination.TaskCount++
        					$scope.toggleUserTaskGroupAssignment(userTaskGroupXref);
        				} catch (e) { }
        			}
        		} else {
        			// List/Task -> List
        			if (!source.TaskTypeToken) { // trying to drag a list into a list
        				toastr.error('Not allowed');
        				return false;
        			} else {
        				var userTaskGroupXref = {
        					UserTaskRowId: source.RowId,
        					UserTaskGroupRowId: destination.RowId
        				};
        				// remove from old list / folder in UI
        				$timeout(function () {
        					$scope.cleanupMovedTasks(source, sourceGroupRowId);
        				});
        				try {
        					source.UserTaskGroupRowId = destination.RowId
        					destination.GroupTasks.push(source)
        					destination.TaskCount++
        					$scope.toggleUserTaskGroupAssignment(userTaskGroupXref);
        				} catch (e) { }
        			}
        		}
        		// just in case
        		return;
        	};

        	function removeTaskFromList(userTask) {
        		var list, elementPos, lists = null;
        		if (userTask.UserTaskGroupRowId != 0) {
        			if ($scope.otherSupervisors.isOtherSupervisorsQueue) {
        				angular.forEach($scope.otherSupervisors.supervisorTasks.UserTaskFoldersList, function (group) {
        					if (!lists || lists.length == 0 && group.GroupSubGroups && group.GroupSubGroups.length > 0) {
        						lists = _.where(group.GroupSubGroups, { RowId: userTask.UserTaskGroupRowId });
        					}
        				});
        				if (lists && lists.length > 0) {
        					list = lists[0];
        				}
        			}
        			else {
        				lists = _.where($scope.userTasksGroupsList, { RowId: userTask.UserTaskGroupRowId });
        				if (lists && lists.length > 0) {
        					list = lists[0];
        				}
        				else {
        					// search groupsubgroups to find our list
        					angular.forEach($scope.userTasksGroupsList, function (group) {
        						if (group.GroupSubGroups && group.GroupSubGroups.length > 0) {
        							lists = _.where(group.GroupSubGroups, { RowId: userTask.UserTaskGroupRowId });
        						}
        					});
        					list = lists[0];
        				}
        			}
        		}
        		else {
        			if ($scope.otherSupervisors.isOtherSupervisorsQueue) {
        				lists = _.where($scope.otherSupervisors.supervisorTasks.UserTaskFoldersList, { RowId: 0 });
        				if (lists && lists.length > 0) {
        					list = lists[0];
        				}
        			}
        			else {
        				list = $scope.individualTasksList;
        			}
        		}
        		if (list) {
        			elementPos = list.GroupTasks.map(function (x) { return x.RowId; }).indexOf(userTask.RowId);
        			list.GroupTasks.splice(elementPos, 1);
        			if (userTask.UserTaskGroupRowId != 0) {
        				// decrement the task list which contained the task
        				list.TaskCount--;

        				// decrement the parent folder of a task list which contained the task
        				if (!list.IsFolder && list.ParentGroupRowId !== null) {
        					var parentLists, parentList;
        					if ($scope.taskLists.selectedTasksList.TaskCount) {
        						$scope.taskLists.selectedTasksList.TaskCount--;
        					} else {
        						parentLists = _.where($scope.userTasksGroupsList, { RowId: list.ParentGroupRowId });
        						if (parentLists && parentLists.length > 0) {
        							parentList = parentLists[0];
        							if (parentList.TaskCount) {
        								parentList.TaskCount--;
        							}
        						}
        					}
        				}

        				if (!list.IsFolder && !list.ParentGroupRowId || !list.IsFolder && list.ParentGroupRowId == null) {
        					$scope.individualTasksList.TaskCount--;
        				}
        			} else {
        				// decrement individual tasks list
        				$scope.individualTasksList.TaskCount--;
        			}
        		}
        	};

        	function removeTasksDecrementCount(list, selectedTasks) {
        		var lists;
        		var parentFolder;

        		// remove tasks
        		_.map(selectedTasks, function (task) {
        			list.GroupTasks.splice(_.indexOf(list.GroupTasks, task), 1);
        		});
        		// decrement task count 
        		list.TaskCount = list.TaskCount - selectedTasks.length;
        		// decrement task count in parent folder
        		if (list.ParentGroupRowId) {
        			if ($scope.otherSupervisors.isOtherSupervisorsQueue) {
        				// other supervisor folder
        				lists = _.where($scope.otherSupervisors.supervisorTasks.UserTaskFoldersList, { RowId: list.ParentGroupRowId });
        			}
        			else {
        				// folder
        				lists = _.where($scope.userTasksGroupsList, { RowId: list.ParentGroupRowId });
        			}
        			parentFolder = lists[0];
        		}
        		else {
        			if ($scope.otherSupervisors.isOtherSupervisorsQueue) {
        				// other supervisor inbox
        				lists = _.where($scope.otherSupervisors.supervisorTasks.UserTaskFoldersList, { RowId: 0 });
        				parentFolder = lists[0];
        			}
        			else {
        				// inbox
        				parentFolder = $scope.individualTasksList;
        			}
        		}
        		if (parentFolder) {
        			parentFolder.TaskCount = parentFolder.TaskCount - selectedTasks.length;
        		}
        	};

        	function dpOptions() {
        		var options = {
        			showWeeks: false
        		}
        		return options;
        	};

        	function addFreqToReminder(reminder) {
        		if (!reminder.Frequencies) reminder.Frequencies = [];
        		var freq = {
        			RowId: 0,
        			ConditionTypeId: 2,
        			RecurrenceTypeId: 1,
        			FrequencyTypeId: 11,
        			FrequencyNumber: 1,
        			FrequencyOrder: 1
        		};
        		reminder.Frequencies.push(freq);
        		console.log(reminder.Frequencies);
        	};

        	function deleteUserTaskGroup(list, parent) {
        		var context = list.IsFolder ? "Folder" : "Task List";
        		bootbox.confirm("Are you sure you want to delete the " + context + " '" + list.Title + "'?", function (result) {
        			if (result) {
        				$scope.isLoaded = false;
        				if (!list.UserRowId) list.UserRowId = userRowId;
        				dataService.remove('UserTaskGroup', list.RowId).then(function (result) {
        					if (list.Title == $scope.taskLists.selectedTasksList.Title) {
        						$rootScope.$broadcast('setSelectedList', { list: $scope.individualTasksList, context: null });
							}
        					$scope.isLoaded = true;
        					toastr.success(context + ' titled \'' + list.Title + '\' has been deleted.');
        					//Need to Ask Josh if this was a requirement
        					//if (parent) {
        					//	// if parent was passed, find the index of our list
        					//	// so we can splice it from the array
        					//	var index = _.indexOf(parent, list);
        					//	$timeout(function () {
        					//		if (index !== -1) {
        					//			parent.splice(index, 1);
        					//			if (list.ParentGroupRowId) {
        					//				var folder = _.find($scope.userTasksGroupsList, { RowId: list.ParentGroupRowId })
        					//				_.map(list.GroupTasks, function (task) {
        					//					task.Selected = false
        					//					task.UserTaskGroupRowId = folder.RowId
        					//					folder.GroupTasks.push(task)
        					//				})
        					//			}
        					//		}
        					//	});
        					//} else {
        					// if list has no parent array then we need to refresh the page (since the list
        					// is now no longer visible and would just leave an empty screen)
        					$scope.searchUserTasks();
        					//}
        				}, function (error) {
        					toastr.error('Failed to delete ' + context + ' titled \'' + list.Title + '\'');
        					$scope.isLoaded = true;
        				});
        			}
        		});
        	};

        	function sortList(data, index, parentlist) {
        		$scope.isSorting = true;
        		//console.log('sortList:got it!', data);
        		//console.log('sortList:dropped on index: ', index);
        		//console.log('sortList:dropping to parentList', parentlist);
        		if (data && parentlist) {
        			var newSortOrder = index;
        			for (var i = 0; i < parentlist.length; i++) {
        				parentlist[i].SortOrder = i + 1;
        			}
        			parentlist.sort(sortOrderComparer);
        			var subsequentSort = newSortOrder;
        			for (var i = 0; i < parentlist.length; i++) {
        				if (parentlist[i].RowId != data.RowId) {
        					if (parentlist[i].SortOrder >= newSortOrder) {
        						subsequentSort++;
        						parentlist[i].SortOrder = subsequentSort;
        					}
        				} else {
        					parentlist[i].SortOrder = newSortOrder;
        				}
        			}
        			data.SortOrder = newSortOrder;
        			parentlist.sort(sortOrderComparer);
        			var ids = [];
        			for (var i = 0; i < parentlist.length; i++) {
        				ids.push(parentlist[i].RowId);
        			}
        			userTaskDataService.persistListSortView(ids);
        		}
        		$scope.isSorting = false;
        	};

        	function sortTask(data, index, parentlistid, parentlist) {
        		console.log('sortTask:got it!', data);
        		console.log('sortTask:dropped on index: ', index);
        		console.log('dropping to parentList', parentlist);
        		console.log('dropping to parentListId', parentlistid);
        		if (data && data.userTask) {
        			var newSortOrder = index;

        			if (data.userTaskGroup != parentlistid) {
        				if (data.userTaskGroup) {
        					unlinkTaskFromGroup(data.userTask);
        				}
        				if (parentlistid) {
        					var userTaskGroupXref = {
        						UserTaskRowId: data.userTask.RowId,
        						UserTaskGroupRowId: parentlistid
        					};
        					toggleUserTaskGroupAssignment(userTaskGroupXref);
        				}
        			}

        			//normalize the sort order values
        			for (var i = 0; i < parentlist.length; i++) {
        				//console.log('before', parentlist[i]);
        				parentlist[i].SortOrder = i + 1;
        				//console.log('after', parentlist[i]);
        			}
        			//sort the list
        			parentlist.sort(sortOrderComparer);
        			//console.log('normalized presort', parentlist);
        			//now bump everything above the new postion up by one
        			var subsequentSort = newSortOrder;
        			for (var i = 0; i < parentlist.length; i++) {
        				if (parentlist[i].RowId != data.userTask.RowId) {
        					if (parentlist[i].SortOrder >= newSortOrder) {
        						subsequentSort++;
        						parentlist[i].SortOrder = subsequentSort;
        					}
        				} else {
        					parentlist[i].SortOrder = newSortOrder;
        				}
        			}
        			data.userTask.SortOrder = newSortOrder;
        			parentlist.sort(sortOrderComparer);
        			//console.log('sort', parentlist);
        			var ids = [];
        			for (var i = 0; i < parentlist.length; i++) {
        				ids.push(parentlist[i].RowId);
        				//console.log(parentlist[i].Title, parentlist[i].SortOrder);
        			}
        			var taskViewModel = {
        				userTaskRowIds: ids,
        				userTaskGroupRowId: parentlistid ? parentlistid : null
        			};
        			userTaskDataService.persistTaskSortView(taskViewModel);
        		}
        	};

        	function sortOrderComparer(a, b) {
        		return (a.SortOrder || 0) - (b.SortOrder || 0);
        	};

        	function isWorkOrder(taskGroup) {
        		var isWorkOrderVal = false;
        		isWorkOrderVal = taskGroup.WorkOrderId !== null && taskGroup.WorkOrderId > 0;
        		return isWorkOrderVal;
        	};

        	// attempt to fix QA

        	// create a mock sample task for display in the UI when
        	// an account is otherwise empty
        	$scope.sampleTaskList = {
        		"Title": "Sample Task List"
        	};
        	$scope.sampleClientTask = {
        		"ActiveServiceTechs": [],
        		"ActiveSubcontractors": [],
        		"ActiveToyEquipment": [{ "ReferenceName": "Sample Boat", "RowId": 0 }],
        		"ActiveToyEquipmentIdsList": [2257, 4087, 4088],
        		"AssignedSupervisorXrefs": [],
        		"AssignedUser": 'Sample business user',
        		"AssignedUserDisplayName": 'Sample business user',
        		"AssignedUserEmail": null,
        		"AssignedUserRowId": $scope.authInfo ? parseInt($scope.authInfo.userRowId) : 0,
        		"CompletedStatus": null,
        		"CompletedStatusDateCreatedFormatted": "",
        		"CompletedUser": null,
        		"CompletedUserName": "",
        		"CompletionManuallyEnteredUser": null,
        		"CompletionManuallyEnteredUserName": "",
        		"CreateUserName": "Sample User",
        		"CreatedBy": $scope.authInfo ? parseInt($scope.authInfo.userRowId) : 0,
        		"CurrentTaskStatus": taskStatus.Posted,
        		"CurrentTaskStatusDescription": "Task Posted",
        		"DateApproved": null,
        		"DateCancelled": null,
        		"DateCompleted": null,
        		"DateCreated": "2015-10-28T19:18:43.363",
        		"DateLastMod": "2015-12-10T20:50:24.947",
        		"DateTaskCreated": "2015-10-28T00:00:00",
        		"DateEstimateApproved": null,
        		"DateEstimateRejected": null,
        		"DateEstimateSubmitted": null,
        		"DateInProgress": null,
        		"DatePosted": null,
        		"EquipmentPersistType": 0,
        		"EquipmentRowId": 0,
        		"EstimateAmount": null,
        		"InProgressReasonsList": [
                    {
                    	"Key": 0,
                    	"Value": "Select Reason"
                    },
                    {
                    	"Key": 1,
                    	"Value": "Waiting for Parts"
                    },
                    {
                    	"Key": 2,
                    	"Value": "Other"
                    }
        		],
        		"IntegrationKey": null,
        		"IsActive": true,
        		"IsBulkPost": false,
        		"IsCompletionDateManuallyEntered": false,
        		"IsCompletionManuallyEntered": false,
        		"IsDeleted": false,
        		"IsRequestEstimate": false,
        		"IsRequestEstimateChecked": false,
        		"IsRequestEstimateFormatted": "No",
        		"IsStatusChange": false,
        		"IsTaskGroupped": false,
        		"IsToyEquipment": false,
        		"Labor": "",
        		"LastModBy": 0,
        		"MaintenanceItemRowId": null,
        		"MessagesCount": 2,
        		"Notes": null,
        		"Opcode": null,
        		"ParentTaskRowId": null,
        		"Rating": 3,
        		"Reason": 0,
        		"ReasonDescription": "Select Reason",
        		"ReasonModel": {
        			"Key": 0,
        			"Value": "Select Reason"
        		},
        		"RequestedCompletionDate": null,
        		"RowGuid": "0000000-1111-2222-3333-444444444444",
        		"RowId": null,
        		"SelectedToyEquipmentIdsList": null,
        		"ServiceTechDisplayName": "None",
        		"ServiceTechReason": null,
        		"ServiceTechStatus": 0,
        		"ServiceTechStatusDescription": "",
        		"ServiceTechStatuses": [],
        		"SortOrder": 0,
        		"Status": 0,
        		"SubcontractorDisplayName": "None",
        		"SubcontractorRowId": null,
        		"SubcontractorStatus": 0,
        		"SubcontractorStatusDescription": "",
        		"SubcontractorStatuses": [],
        		"TaskIndex": 0,
        		"TaskType": 1,
        		"TaskTypeToken": "ClientTask",
        		"TaskUserName": $scope.authInfo ? $scope.authInfo.userName : 'Sample User',
        		"Title": "Sample Client Task (demo)",
        		"ToyEquipmentName": "Sample equipment name",
        		"ToyName": "Sample boat name",
        		"ToyRowId": "sample_toy_id",
        		"UserRowId": $scope.authInfo ? parseInt($scope.authInfo.userRowId) : 0,
        		"UserTaskEquipmentXrefs": [],
        		"UserTaskFeedbacks": [],
        		"UserTaskGroupRowId": 0,
        		"UserTaskGroupXrefRowId": null,
        		"UserTaskGroupXrefs": [],
        		"UserTaskHours": [],
        		"UserTaskMessages": [
                    {
                    	"RowId": 0,
                    	"RowGuid": null,
                    	"UserTaskRowId": null,
                    	"DateCreated": "2016-01-11T15:15:14.44",
                    	"DateLastMod": null,
                    	"IsActive": null,
                    	"IsDeleted": null,
                    	"CreatedBy": null,
                    	"LastModBy": null,
                    	"Message": "This is a client message test.",
                    	"VisibleByOwner": true,
                    	"Metadata": null,
                    	"MessageXrefs": null,
                    	"ParentRowId": 0,
                    	"ParentType": 0,
                    	"CreatedByName": "Sample User"
                    },
                    {
                    	"RowId": 1,
                    	"RowGuid": null,
                    	"UserTaskRowId": null,
                    	"DateCreated": "2015-12-11T17:07:12.683",
                    	"DateLastMod": null,
                    	"IsActive": null,
                    	"IsDeleted": null,
                    	"CreatedBy": null,
                    	"LastModBy": null,
                    	"Message": "This is a business message test.",
                    	"VisibleByOwner": true,
                    	"Metadata": null,
                    	"MessageXrefs": null,
                    	"ParentRowId": 0,
                    	"ParentType": 0,
                    	"CreatedByName": "Sample Business User"
                    }
        		],
        		"UserTaskNotes": [],
        		"UserTaskServiceTechXrefs": [],
        		"UserTaskSharings": [],
        		"UserTaskStatus": {},
        		"UserTaskSubcontractorXrefs": [],
        		"UserTaskTags": [
                    {
                    	"Tag": "Sample task",
                    	"UserTaskRowId": $scope.authInfo ? parseInt($scope.authInfo.userRowId) : 0
                    }
        		],
        		"ViewingUserRowId": $scope.authInfo ? parseInt($scope.authInfo.userRowId) : 0,
        		"WorkOrderId": null
        	};
        	$scope.sampleUserTask = {
        		"ActiveServiceTechs": [],
        		"ActiveSubcontractors": [],
        		"ActiveToyEquipment": [{ "ReferenceName": "Sample Boat", "RowId": 0 }],
        		"ActiveToyEquipmentIdsList": [2257, 4087, 4088],
        		"AssignedSupervisorXrefs": [],
        		"AssignedUser": null,
        		"AssignedUserDisplayName": 'Sample user',
        		"AssignedUserEmail": null,
        		"AssignedUserRowId": $scope.authInfo ? parseInt($scope.authInfo.userRowId) : 0,
        		"CompletedStatus": null,
        		"CompletedStatusDateCreatedFormatted": "",
        		"CompletedUser": null,
        		"CompletedUserName": "",
        		"CompletionManuallyEnteredUser": null,
        		"CompletionManuallyEnteredUserName": "",
        		"CreateUserName": "Sample User",
        		"CreatedBy": $scope.authInfo ? parseInt($scope.authInfo.userRowId) : 0,
        		"CurrentTaskStatus": taskStatus.NotAssigned,
        		"CurrentTaskStatusDescription": "Not Assigned",
        		"DateApproved": null,
        		"DateCancelled": null,
        		"DateCompleted": null,
        		"DateCreated": "2015-10-28T19:18:43.363",
        		"DateLastMod": "2015-12-10T20:50:24.947",
        		"DateTaskCreated": "2015-10-28T00:00:00",
        		"DateEstimateApproved": null,
        		"DateEstimateRejected": null,
        		"DateEstimateSubmitted": null,
        		"DateInProgress": null,
        		"DatePosted": null,
        		"EquipmentPersistType": 0,
        		"EquipmentRowId": 0,
        		"EstimateAmount": null,
        		"InProgressReasonsList": [
                    {
                    	"Key": 0,
                    	"Value": "Select Reason"
                    },
                    {
                    	"Key": 1,
                    	"Value": "Waiting for Parts"
                    },
                    {
                    	"Key": 2,
                    	"Value": "Other"
                    }
        		],
        		"IntegrationKey": null,
        		"IsActive": true,
        		"IsBulkPost": false,
        		"IsCompletionDateManuallyEntered": false,
        		"IsCompletionManuallyEntered": false,
        		"IsDeleted": false,
        		"IsRequestEstimate": false,
        		"IsRequestEstimateChecked": false,
        		"IsRequestEstimateFormatted": "No",
        		"IsStatusChange": false,
        		"IsTaskGroupped": false,
        		"IsToyEquipment": false,
        		"Labor": "",
        		"LastModBy": 0,
        		"MaintenanceItemRowId": null,
        		"MessagesCount": 2,
        		"Notes": null,
        		"Opcode": null,
        		"ParentTaskRowId": null,
        		"Rating": 3,
        		"Reason": 0,
        		"ReasonDescription": "Select Reason",
        		"ReasonModel": {
        			"Key": 0,
        			"Value": "Select Reason"
        		},
        		"RequestedCompletionDate": null,
        		"RowGuid": "0000000-1111-2222-3333-444444444444",
        		"RowId": null,
        		"SelectedToyEquipmentIdsList": null,
        		"ServiceTechDisplayName": "None",
        		"ServiceTechReason": null,
        		"ServiceTechStatus": 0,
        		"ServiceTechStatusDescription": "",
        		"ServiceTechStatuses": [],
        		"SortOrder": 0,
        		"Status": 0,
        		"SubcontractorDisplayName": "None",
        		"SubcontractorRowId": null,
        		"SubcontractorStatus": 0,
        		"SubcontractorStatusDescription": "",
        		"SubcontractorStatuses": [],
        		"TaskIndex": 0,
        		"TaskType": 1,
        		"TaskTypeToken": "UserTask",
        		"TaskUserName": $scope.authInfo ? $scope.authInfo.userName : 'Sample User',
        		"Title": "Sample User Task (demo)",
        		"ToyEquipmentName": "Sample equipment name",
        		"ToyName": "Sample boat name",
        		"ToyRowId": "sample_toy_id",
        		"UserRowId": $scope.authInfo ? parseInt($scope.authInfo.userRowId) : 0,
        		"UserTaskEquipmentXrefs": [],
        		"UserTaskFeedbacks": [],
        		"UserTaskGroupRowId": 0,
        		"UserTaskGroupXrefRowId": null,
        		"UserTaskGroupXrefs": [],
        		"UserTaskHours": [],
        		"UserTaskMessages": [
                    {
                    	"RowId": 0,
                    	"RowGuid": null,
                    	"UserTaskRowId": null,
                    	"DateCreated": "2016-01-11T15:15:14.44",
                    	"DateLastMod": null,
                    	"IsActive": null,
                    	"IsDeleted": null,
                    	"CreatedBy": null,
                    	"LastModBy": null,
                    	"Message": "This is a client message test.",
                    	"VisibleByOwner": true,
                    	"Metadata": null,
                    	"MessageXrefs": null,
                    	"ParentRowId": 0,
                    	"ParentType": 0,
                    	"CreatedByName": "Sample User"
                    },
                    {
                    	"RowId": 1,
                    	"RowGuid": null,
                    	"UserTaskRowId": null,
                    	"DateCreated": "2015-12-11T17:07:12.683",
                    	"DateLastMod": null,
                    	"IsActive": null,
                    	"IsDeleted": null,
                    	"CreatedBy": null,
                    	"LastModBy": null,
                    	"Message": "This is a business message test.",
                    	"VisibleByOwner": true,
                    	"Metadata": null,
                    	"MessageXrefs": null,
                    	"ParentRowId": 0,
                    	"ParentType": 0,
                    	"CreatedByName": "Sample Business User"
                    }
        		],
        		"UserTaskNotes": [],
        		"UserTaskServiceTechXrefs": [],
        		"UserTaskSharings": [],
        		"UserTaskStatus": {},
        		"UserTaskSubcontractorXrefs": [],
        		"UserTaskTags": [
                    {
                    	"Tag": "Sample task",
                    	"UserTaskRowId": $scope.authInfo ? parseInt($scope.authInfo.userRowId) : 0
                    }
        		],
        		"ViewingUserRowId": $scope.authInfo ? parseInt($scope.authInfo.userRowId) : 0,
        		"WorkOrderId": null
        	};

        	angular.extend($scope, {
        		authInfo: authService.getAuthInfo(),
        		dt: new Date(),
        		minDate: new Date(),
        		clientTasks: {
        			isClientTasksLoaded: false,
        			isClientTasksTitle: false,
        		},
        		myFoldersList: [],
        		userTasksGroupsList: [],
        		taskLists: {
        			isLoaded: false,
        			selectedTasksList: [],
        		},
        		addingTask: {},
        		addingOpCode: {},
        		individualTasksList: {
        			RowId: 0,
        			GroupTasks: [],
        			open: true,
        			TaskCount: 0,
        		},
        		sharedTasksList: [],
        		primaryQueueList: [],
        		inboxLists: { 'All': null, 'Past Due': null, 'Upcoming': null, 'Snoozed': null },
        		userToys: [],
        		clientToys: [],
        		toyEquipment: [],
        		isCollapsed: {
        			search: true
        		},
        		isVisible: {
        			isMessage: true,
        			isViewableByOwner: false,//($scope.isBusinessSupervisor || $scope.isBusinessPremium),
        			isSpinner: true,
        		},
        		isQueue: false,
        		expandCollapse: expandCollapse,
        		toggleSelectedTaskList: toggleSelectedTaskList,
        		getMyStuff: getMyStuff,
        		getListMessages: getListMessages,
        		newUserTask: MyVillages.TaskerApp.UserTask(),
        		activePrimaryQueue: JSON.stringify($cookieStore.get('task-queue')) || taskQueue.Open,
        		selectUserTaskQueue: selectUserTaskQueue,
        		activePrimaryInbox: null,
        		selectRemindersInbox: selectRemindersInbox,
        		addUserTaskFromTaskList: addUserTaskFromTaskList,
        		newUserTaskAdded: newUserTaskAdded,
        		newUserTaskFromTaskListAdded: newUserTaskFromTaskListAdded,
        		menuClass: menuClass,
        		updateUserTaskGroup: updateUserTaskGroup,
        		toggleUserTaskGroupAssignment: toggleUserTaskGroupAssignment,
        		unlinkTaskFromGroup: unlinkTaskFromGroup,
        		gotoHome: gotoHome,
        		opened: {},
        		isBusinessPremium: isBusinessPremium,
        		selectedClient: null,
        		statuses: [],
        		searchFilters: {
        			status: {
        				Text: 'All',
        				Value: -1
        			},
        			clientKeyword: null,
        			keyword: '',
        			createUser: null,
        			lastModUser: null,
        			assignedUser: null,
        			assignedServiceTech: null,
        			completeUser: null,
        			createDate: null,
        			lastModDate: null,
        			requestedCompletionDate: null,
        			completeDate: null,
        		},
        		getTaskUsersList: getTaskUsersList,
        		getMyFoldersList: getMyFoldersList,
        		removeTaskFromList: removeTaskFromList,
        		suggestClient: suggestClient,
        		suggestContact: suggestContact,
        		suggestServiceProviders: suggestServiceProviders,
        		getOtherSupervisors: getOtherSupervisors,
        		openDatepicker: openDatepicker,
        		dpOptions: dpOptions,
        		addFreqToReminder: addFreqToReminder,
        		taskPost: [],
        		assignUser: assignUser,
        		otherSupervisors: {
        			isOtherSupervisorsQueue: false,
        			supervisorsList: [],
        			selectedSupervisorId: null,
        			selectedSupervisorName: '',
        			supervisorTasks: {},
        			supervisorSearchType: 3,
        			dontSearchOnClear: false,
        			isShowReassignedTasks: false,
        		},
        		listOrTaskById: {
        			isTaskById: false,
        			taskId: 0,
        			isListById: false,
        			listId: 0,
        			listOrTaskByIdTasks: {},
        			dontSearchOnClear: false,
        		},
        		isEligibleBulkTasks: isEligibleBulkTasks,
        		createdByUsers: [],
        		lastModByUsersList: [],
        		assignedUsersList: [],
        		completedByUsers: [],
        		serviceTechs: [],
        		isFiltersLoaded: false,
        		searchUserTasks: searchUserTasks,
        		searchClientTasks: searchClientTasks,
        		getSupervisorTasks: getSupervisorTasks,
        		searchTasks: searchTasks,
        		clearSearch: clearSearch,
        		clearStatus: clearStatus,
        		today: today,
        		isPermission: isPermission,
        		isPremiumFeature: isPremiumFeature,
        		deleteUserTaskGroup: deleteUserTaskGroup,
        		supervisors: [],
        		subcontractors: [],
        		sortTask: sortTask,
        		sortList: sortList,
        		isSorting: false,
        		isWorkOrder: isWorkOrder,
        		createLinkedList: createLinkedList,
        		removeTasksDecrementCount: removeTasksDecrementCount,
        		clearTaskGroupRating: clearTaskGroupRating,
        		updateTaskGroupRating: updateTaskGroupRating
        	});

        	initialize();

        }
    ]);