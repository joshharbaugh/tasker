angular.module('myVillages.tasker.app.assignSubcontractor')
    .directive('tkAssignSubcontractor', [function () {
    	return {
    		restrict: 'AE',
    		scope: {
    			taskList: '=',
    		},
    		templateUrl: '/Scripts/tasker/app/assignSubcontractor/assignSubcontractor.html',
    		controller: ['$scope', '$sce', 'userTaskDataService', 'dataService', 'taskStatus', 'linkedListType', '$q', '$window', '$filter', '$timeout',
				function ($scope, $sce, userTaskDataService, dataService, taskStatus, linkedListType, $q, $window, $filter, $timeout) {

					function assignSubcontractor() {
						var assignSubcontractorTasks;
						var selectedTasks = _.where($scope.taskList.GroupTasks, { Selected: true });
						// check if list is linked
						if ($scope.taskList.IsMessagesLinked) {
							var taskListXref = {
								Title: $scope.taskList.Title,
								UserRowId: $scope.post.subcontractorRowId,
								ParentListRowId: $scope.taskList.RowId,
								LinkedListTypeId: linkedListType.SubcontractorList,
							};
							assignSubcontractorTasks = $scope.$parent.createLinkedList(taskListXref).then(function (result) {
								return subcontractorAssignment(selectedTasks);
							}, function (error) {
								toastr.error('Failed to create linked list');
								$scope.isClientTasksLoaded = true;
							});
						}
						else {
							assignSubcontractorTasks = subcontractorAssignment(selectedTasks);
						}
						$q.when(assignSubcontractorTasks).then(function (result) {
							resetAssignSubcontractor();
							toastr.success('Selected Tasks have been assigned to specified Subcontractor.');
						});
					}

					function subcontractorAssignment(selectedTasks) {
						return $q.all(_.map(selectedTasks, function (task) {
							var userTaskSubcontractorXref = {
								UserTaskRowId: task.RowId,
								UserTaskTitle: task.Title,
								AssignedBy: $scope.supervisorRowId,
								SubcontractorRowId: $scope.post.subcontractorRowId,
							};
							return userTaskDataService.assignSubcontractor(userTaskSubcontractorXref).then(function (result) {
								$.extend(true, task, result);
							});
						}));
					}

					function cancelAssignSubcontractor() {
						resetAssignSubcontractor();
					}

					function resetAssignSubcontractor() {
						$scope.post = {
							subcontractorRowId: 0,
						};
						$scope.taskList.isAssignSubcontractorOpen = false;
						$scope.taskList.isBulkActionsOpen = false;
					}

					angular.extend($scope, {
						supervisorRowId: 0,
						subcontractors: [],
						post: {
							subcontractorRowId: 0,
						},
						assignSubcontractor: assignSubcontractor,
						subcontractorAssignment: subcontractorAssignment,
						cancelAssignSubcontractor: cancelAssignSubcontractor,
						resetAssignSubcontractor: resetAssignSubcontractor,
					});

				}],
    		link: function (scope, element, attrs, ctrl) {
    			scope.supervisorRowId = scope.$parent.otherSupervisors.isOtherSupervisorsQueue ? parseInt(scope.$parent.otherSupervisors.selectedSupervisorId) : parseInt(scope.$parent.authInfo.userRowId);
    			scope.subcontractors = scope.$parent.subcontractors;
    		}
    	};
    }]);