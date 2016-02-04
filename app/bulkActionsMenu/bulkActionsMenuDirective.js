angular.module('myVillages.tasker.app.bulkActionsMenu')
    .directive('tkBulkActionsMenu', [function () {
    	return {
    		restrict: 'AE',
    		scope: {
    			taskList: '=',
    		},
    		templateUrl: '/Scripts/tasker/app/bulkActionsMenu/bulkActionsMenu.html',
    		controller: ['$scope', '$sce', 'userTaskDataService', 'dataService', 'taskStatus', '$modal', 'modalService', '$q', '$window', '$filter', '$timeout', 'appStorage', '$cookieStore', '$rootScope',
				function ($scope, $sce, userTaskDataService, dataService, taskStatus, $modal, modalService, $q, $window, $filter, $timeout, appStorage, $cookieStore, $rootScope) {

					$scope.$watch('taskList.numSelected', function () {
						computeVisibilitySettings();
					});

					function computeVisibilitySettings() {
						$scope.selectedTasks = _.where($scope.taskList.GroupTasks, { Selected: true });
						$scope.taskCounts = {
							UserTaskNotAssigned: _.where($scope.selectedTasks, { TaskTypeToken: "UserTask", CurrentTaskStatus: taskStatus.NotAssigned }).length,
							UserTaskPosted: _.where($scope.selectedTasks, { TaskTypeToken: "UserTask", CurrentTaskStatus: taskStatus.Posted }).length,
							UserTaskAwaitingApproval: _.where($scope.selectedTasks, { TaskTypeToken: "UserTask", CurrentTaskStatus: taskStatus.AwaitingApproval }).length,
							UserTaskAwaitingClientApproval: _.where($scope.selectedTasks, { TaskTypeToken: "UserTask", CurrentTaskStatus: taskStatus.AwaitingClientApproval }).length,
							UserTaskEstimateApproved: _.where($scope.selectedTasks, { TaskTypeToken: "UserTask", CurrentTaskStatus: taskStatus.EstimateApproved }).length,
							UserTaskInProgress: _.where($scope.selectedTasks, { TaskTypeToken: "UserTask", CurrentTaskStatus: taskStatus.InProgress }).length,
							ClientTaskPosted: _.where($scope.selectedTasks, { TaskTypeToken: "ClientTask", CurrentTaskStatus: taskStatus.Posted }).length,
							ClientTaskApproved: _.where($scope.selectedTasks, { TaskTypeToken: "ClientTask", CurrentTaskStatus: taskStatus.Approved }).length,
							ClientTaskPendingEstimate: _.where($scope.selectedTasks, { TaskTypeToken: "ClientTask", CurrentTaskStatus: taskStatus.PendingEstimate }).length,
							ClientTaskEstimateApproved: _.where($scope.selectedTasks, { TaskTypeToken: "ClientTask", CurrentTaskStatus: taskStatus.EstimateApproved }).length,
							ClientTaskInProgress: _.where($scope.selectedTasks, { TaskTypeToken: "ClientTask", CurrentTaskStatus: taskStatus.InProgress }).length,
						};

						var userTaskVisible =
							$scope.taskCounts.UserTaskNotAssigned > 1
							&& $scope.taskCounts.UserTaskPosted == 0
							&& $scope.taskCounts.UserTaskAwaitingApproval == 0
							&& $scope.taskCounts.UserTaskAwaitingClientApproval == 0
							&& $scope.taskCounts.UserTaskEstimateApproved == 0
							&& $scope.taskCounts.UserTaskInProgress == 0
							&& $scope.taskCounts.ClientTaskPosted == 0
							&& $scope.taskCounts.ClientTaskApproved == 0
							&& $scope.taskCounts.ClientTaskPendingEstimate == 0
							&& $scope.taskCounts.ClientTaskEstimateApproved == 0
							&& $scope.taskCounts.ClientTaskInProgress == 0;
						var clientTaskVisible =
							$scope.taskCounts.UserTaskNotAssigned == 0
							&& $scope.taskCounts.UserTaskPosted == 0
							&& $scope.taskCounts.UserTaskAwaitingApproval == 0
							&& $scope.taskCounts.UserTaskAwaitingClientApproval == 0
							&& $scope.taskCounts.UserTaskEstimateApproved == 0
							&& $scope.taskCounts.UserTaskInProgress == 0
							&& $scope.taskCounts.ClientTaskPendingEstimate == 0
							&& ($scope.taskCounts.ClientTaskPosted
							+ $scope.taskCounts.ClientTaskApproved
							+ $scope.taskCounts.ClientTaskEstimateApproved
							+ $scope.taskCounts.ClientTaskInProgress) > 1;

						$scope.isVisible = {
							PostSelectedTasks: userTaskVisible,
							DeleteSelectedTasks: userTaskVisible,
							CompleteSelectedTasks: $scope.selectedTasks.length > 1,
							StartSelectedTasks:
								$scope.taskCounts.UserTaskNotAssigned == 0
								&& $scope.taskCounts.UserTaskPosted == 0
								&& $scope.taskCounts.UserTaskAwaitingApproval == 0
								&& $scope.taskCounts.UserTaskAwaitingClientApproval == 0
								&& $scope.taskCounts.UserTaskEstimateApproved == 0
								&& $scope.taskCounts.UserTaskInProgress == 0
								&& $scope.taskCounts.ClientTaskPendingEstimate == 0
								&& $scope.taskCounts.ClientTaskInProgress == 0
								&& ($scope.taskCounts.ClientTaskPosted
								+ $scope.taskCounts.ClientTaskApproved
								+ $scope.taskCounts.ClientTaskEstimateApproved) > 1,
							ReassignSupervisor: clientTaskVisible,
							AssignServiceTech: clientTaskVisible,
							AssignSubcontractor: clientTaskVisible,
						};
					};

					function completeSelectedTasks() {
						var reqTimeout;
						bootbox.confirm("Are you sure you want to mark the selected tasks as Completed?", function (result) {
							if (result) {
								var completeTasks = $q.all(_.map($scope.selectedTasks, function (task) {
									var userTaskStatus = {
										UserTaskRowId: task.RowId,
										Status: taskStatus.Completed,
										StatusChangeDate: new Date()
									};
									return userTaskDataService.updateStatus(userTaskStatus).then(function (result) {
										removeTaskUpdateCount(task);
									});
								}));
								$q.when(completeTasks).then(function (result) {
									resetMultiSelectData();
									toastr.success('Selected Tasks Status has been updated to Completed');
								});
							}
						});
					};

					function deleteSelectedTasks() {
						bootbox.confirm("Are you sure you want to delete the selected tasks?", function (result) {
							if (result) {
								var deleteTasks = $q.all(_.map($scope.selectedTasks, function (task) {
									return userTaskDataService.remove(task).then(function (result) {
										removeTaskUpdateCount(task);
									});
								}));
								$q.when(deleteTasks).then(function (result) {
									resetMultiSelectData();
									toastr.success('Selected Tasks have been removed.');
								});
							}
						});
					};

					function openAssignUser() {
						$scope.taskList.isAssignUserOpen = true;
						$scope.taskList.isReassignSupervisorOpen = false;
						$scope.taskList.isAssignServiceTechOpen = false;
						$scope.taskList.isAssignSubcontractorOpen = false;
						$scope.taskList.isBulkActionsOpen = false;
					}

					function startSelectedTasks() {
						bootbox.confirm("Are you sure you want to start the selected tasks?", function (result) {
							if (result) {
								var startTasks = $q.all(_.map($scope.selectedTasks, function (task) {
									return updateTasksStatus(task, taskStatus.InProgress)
								}));
								$q.when(startTasks).then(function (result) {
									resetMultiSelectData();
									toastr.success('Selected Tasks have been started.');
								});
							}
						});
					};

					function reassignSupervisor() {
						$scope.taskList.isAssignUserOpen = false;
						$scope.taskList.isReassignSupervisorOpen = true;
						$scope.taskList.isAssignServiceTechOpen = false;
						$scope.taskList.isAssignSubcontractorOpen = false;
						$scope.taskList.isBulkActionsOpen = false;
					}

					function assignServiceTech() {
						$scope.taskList.isAssignUserOpen = false;
						$scope.taskList.isReassignSupervisorOpen = false;
						$scope.taskList.isAssignServiceTechOpen = true;
						$scope.taskList.isAssignSubcontractorOpen = false;
						$scope.taskList.isBulkActionsOpen = false;
					}

					function assignSubcontractor() {
						$scope.taskList.isAssignUserOpen = false;
						$scope.taskList.isReassignSupervisorOpen = false;
						$scope.taskList.isAssignServiceTechOpen = false;
						$scope.taskList.isAssignSubcontractorOpen = true;
						$scope.taskList.isBulkActionsOpen = false;
					}

					function updateTasksStatus(task, status) {
						var userTaskStatus = {
							UserTaskRowId: task.RowId,
							Status: status,
							StatusChangeDate: new Date()
						};
						return userTaskDataService.updateStatus(userTaskStatus).then(function (result) {
							$.extend(true, task, result);
						});
					}

					function removeTaskUpdateCount(task) {
						// remove task from ui
						$scope.taskList.GroupTasks.splice(_.indexOf($scope.taskList.GroupTasks, task), 1);
						// decrement task count
						$scope.taskList.TaskCount--;
						if ($scope.taskList.RowId === 0) {
							// decrement Inbox
							$scope.$parent.individualTasksList.TaskCount--;
						}
						// check if a list is a child for the folder
						if ($scope.taskList.ParentGroupRowId) {
							var lists = _.where($scope.$parent.userTasksGroupsList, { RowId: $scope.taskList.ParentGroupRowId });
							var list = lists[0];
							// decrement parent task count
							list.TaskCount--;
						}
					}

					function resetMultiSelectData() {
						$scope.taskList.taskPost = {
							AssignedUserRowId: null,
							AssignedUserEmail: '',
							TypeaheadDisplay: '',
							ToyRowId: null,
							EquipmentRowId: null,
							IsRequestEstimateChecked: false,
							IsRequestEstimate: false,
							RequestedCompletionDate: null,
							ServiceTechRowId: null,
							FirstName: '',
							LastName: '',
							DisplayName: '',
							IsBusiness: false,
							BusinessRowId: null,
							BusinessName: '',
							IsSupervisor: false,
							IsNewContact: false,
						};
						$scope.taskList.assignedUser = null;
						$scope.taskList.isAssignUserOpen = false;
						$scope.taskList.isBulkActionsOpen = false;
					}

					angular.extend($scope, {
						selectedTasks: [],
						taskCounts: {
							UserTaskNotAssigned: 0,
							UserTaskPosted: 0,
							UserTaskAwaitingApproval: 0,
							UserTaskAwaitingClientApproval: 0,
							UserTaskEstimateApproved: 0,
							UserTaskInProgress: 0,
							ClientTaskPosted: 0,
							ClientTaskApproved: 0,
							ClientTaskPendingEstimate: 0,
							ClientTaskEstimateApproved: 0,
							ClientTaskInProgress: 0,
						},
						isVisible: {
							PostSelectedTasks: false,
							CompleteSelectedTasks: false,
							DeleteSelectedTasks: false,
							StartSelectedTasks: false,
							ReassignSupervisor: false,
							AssignServiceTech: false,
							AssignSubcontractor: false,
						},
						computeVisibilitySettings: computeVisibilitySettings,
						completeSelectedTasks: completeSelectedTasks,
						deleteSelectedTasks: deleteSelectedTasks,
						resetMultiSelectData: resetMultiSelectData,
						openAssignUser: openAssignUser,
						reassignSupervisor: reassignSupervisor,
						assignServiceTech: assignServiceTech,
						assignSubcontractor: assignSubcontractor,
						startSelectedTasks: startSelectedTasks,
					});

				}],
    		link: function (scope, element, attrs, ctrl) {
    		    $('html').click(function (e) {
    		        if (scope.taskList.isBulkActionsOpen &&
                        $(e.target).attr("class") !== "glyphicon glyphicon-th-list") {
    		            scope.taskList.isBulkActionsOpen = !scope.taskList.isBulkActionsOpen
    		        }
    		    })
    		}
    	};
    }]);