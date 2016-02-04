angular.module('myVillages.tasker.app.reassignSupervisor')
    .directive('tkReassignSupervisor', [function () {
    	return {
    		restrict: 'AE',
    		scope: {
    			taskList: '=',
    		},
    		templateUrl: '/Scripts/tasker/app/reassignSupervisor/reassignSupervisor.html',
    		controller: ['$scope', '$sce', 'userTaskDataService', 'dataService', 'taskStatus', 'linkedListType', '$q', '$window', '$filter', '$timeout',
				function ($scope, $sce, userTaskDataService, dataService, taskStatus, linkedListType, $q, $window, $filter, $timeout) {

					function reassignSupervisor() {
						var reassignSupervisorTasks;
						var selectedTasks = _.where($scope.taskList.GroupTasks, { Selected: true });
						// check if list is linked
						if ($scope.taskList.IsMessagesLinked) {
							var taskListXref = {
								Title: $scope.taskList.Title,
								UserRowId: $scope.selectedSupervisor.RowId,
								ParentListRowId: $scope.taskList.RowId,
								LinkedListTypeId: linkedListType.SupervisorList,
							};
							reassignSupervisorTasks = $scope.$parent.createLinkedList(taskListXref).then(function (result) {
								return reassignTasks(selectedTasks);
							}, function (error) {
								toastr.error('Failed to create linked list');
								$scope.isClientTasksLoaded = true;
							});
						}
						else {
							reassignSupervisorTasks = reassignTasks(selectedTasks);
						}
						$q.when(reassignSupervisorTasks).then(function (result) {
							$scope.$parent.removeTasksDecrementCount($scope.taskList, selectedTasks);
							resetReassignSupervisor();
							toastr.success('Selected Tasks have been reassigned.');
						});
					}

					function reassignTasks(selectedTasks) {
						var viewingUserRowId =
							$scope.$parent.otherSupervisors.isOtherSupervisorsQueue
							? $scope.$parent.otherSupervisors.selectedSupervisorId
							: $scope.$parent.authInfo.userRowId;
						var selectedSupervisorRowId = $scope.selectedSupervisor.RowId;
						var taskListXref = {
							Title: $scope.taskList.Title,
							UserRowId: selectedSupervisorRowId,
							ParentListRowId: $scope.taskList.RowId,
							LinkedListTypeId: linkedListType.ProviderList,
						};
						$scope.$parent.createLinkedList(taskListXref).then(function (result) {
							$q.all(_.map(selectedTasks, function (task) {
								var args = {
									UserTaskRowId: task.RowId,
									AssignedUserRowId: selectedSupervisorRowId,
									ViewingUserRowId: viewingUserRowId,
								}
								userTaskDataService.assignSupervisor(args);
							}));
						}, function (error) {
							toastr.error('Failed to create linked list');
							$scope.isClientTasksLoaded = true;
						});
					}

					function cancelReassignSupervisor() {
						resetReassignSupervisor();
					}

					function resetReassignSupervisor() {
						$scope.selectedSupervisor.RowId = 0;
						$scope.taskList.numSelected = 0;
						$scope.taskList.isReassignSupervisorOpen = false;
						$scope.taskList.isBulkActionsOpen = false;
					}

					angular.extend($scope, {
						supervisors: [],
						selectedSupervisor: {
							RowId: 0,
							ViewingUserRowId: 0,
						},
						reassignSupervisor: reassignSupervisor,
						cancelReassignSupervisor: cancelReassignSupervisor,
						resetReassignSupervisor: resetReassignSupervisor,
					});

				}],
    		link: function (scope, element, attrs, ctrl) {
    			scope.selectedSupervisor.ViewingUserRowId = scope.$parent.otherSupervisors.isOtherSupervisorsQueue ? parseInt(scope.$parent.otherSupervisors.selectedSupervisorId) : parseInt(scope.$parent.authInfo.userRowId);
    			scope.selectedSupervisor.RowId = scope.selectedSupervisor.ViewingUserRowId;
    			scope.supervisors = scope.$parent.supervisors;
    		}
    	};
    }]);