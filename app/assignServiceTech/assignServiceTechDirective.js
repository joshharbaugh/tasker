angular.module('myVillages.tasker.app.assignServiceTech')
    .directive('tkAssignServiceTech', [function () {
    	return {
    		restrict: 'AE',
    		scope: {
    			taskList: '=',
    		},
    		templateUrl: '/Scripts/tasker/app/assignServiceTech/assignServiceTech.html',
    		controller: ['$scope', '$sce', 'userTaskDataService', 'dataService', 'taskStatus', 'linkedListType', '$q', '$window', '$filter', '$timeout',
				function ($scope, $sce, userTaskDataService, dataService, taskStatus, linkedListType, $q, $window, $filter, $timeout) {

					function suggestServiceTech(searchKeyword) {
						return userTaskDataService.getSuggestedServiceTechs(searchKeyword).then(function (results) {
							return results;
						});
					};

					function typeaheadDisplayServiceTech(data) {
					    var display = '';
                        if (data == undefined || data == null || $scope.serviceTech == null) {
							display = '';
						}
						else if (typeof data === 'object') {
							display = data.TypeaheadDisplay;
						}
						else {
							display = data;
						}
						return display;
					}

					function checkUser(data) {
						// check if data is an object or a string
						if (typeof data === 'object') {
							$scope.serviceTech = {
								AssignedUserRowId: data.AssignedUserRowId,
								TypeaheadDisplay: data.TypeaheadDisplay,
								IsNewContact: false,
							};
						}
						else {
							// validate email
							if (data.indexOf('@') == -1 || data.indexOf('.') == -1) {
								toastr.error('Please enter valid email address');
								return false;
							}
							else {
								// check if user exists
								userTaskDataService.checkUserExistence(data).then(function (result) {
									$scope.serviceTech = {
										AssignedUserRowId: result.AssignedUserRowId,
										AssignedUserEmail: result.EmailAddress,
										TypeaheadDisplay: result.TypeaheadDisplay,
										ServiceTechRowId: null,
										FirstName: result.FirstName,
										LastName: result.LastName,
										DisplayName: result.DisplayName,
										IsBusiness: result.IsBusiness,
										BusinessRowId: result.BusinessRowId,
										BusinessName: result.BusinessName,
										IsSupervisor: result.IsSupervisor,
										IsNewContact: result.IsNewContact,
									};
								});
							}
						}
					}

					function assignServiceTech() {
						var assignServiceTechTasks;
						var selectedTasks = _.where($scope.taskList.GroupTasks, { Selected: true });
						// check if list is linked
						if ($scope.taskList.IsMessagesLinked) {
							var taskListXref = {
								Title: $scope.taskList.Title,
								UserRowId: $scope.serviceTech.AssignedUserRowId,
								ParentListRowId: $scope.taskList.RowId,
								LinkedListTypeId: linkedListType.ServiceTechList,
							};
							assignServiceTechTasks = $scope.$parent.createLinkedList(taskListXref).then(function (result) {
								return serviceTechAssignment(selectedTasks);
							}, function (error) {
								toastr.error('Failed to create linked list');
								$scope.isClientTasksLoaded = true;
							});
						}
						else {
							assignServiceTechTasks = serviceTechAssignment(selectedTasks);
						}
						$q.when(assignServiceTechTasks).then(function (result) {
							resetAssignServiceTech();
							toastr.success('Selected Tasks have been assigned to specified Service Tech.');
						});
					};

					function serviceTechAssignment(selectedTasks) {
						return $q.all(_.map(selectedTasks, function (task) {
							var userTaskServiceTechXref = {
								UserTaskRowId: task.RowId,
								UserTaskTitle: task.Title,
								AssignedBy: $scope.supervisorRowId,
								ServiceTechRowId: $scope.serviceTech.AssignedUserRowId,
								ServiceTechEmail: $scope.serviceTech.AssignedUserEmail,
							};
							return userTaskDataService.assignServiceTech(userTaskServiceTechXref).then(function (result) {
								if (result == null) {
									toastr.error('Service Tech already assigned');
								}
								else {
									$.extend(true, task, result);
								}
							});
						}));
					}

					function cancelAssignServiceTech() {
						resetAssignServiceTech();
					}

					function resetAssignServiceTech() {
						$scope.serviceTech = {
							AssignedUserRowId: 0,
							AssignedUserEmail: '',
							TypeaheadDisplay: '',
							ServiceTechRowId: 0,
							FirstName: '',
							LastName: '',
							DisplayName: '',
							IsBusiness: false,
							BusinessRowId: 0,
							BusinessName: '',
							IsSupervisor: false,
							IsNewContact: false,
						};
						$scope.post = {
							ServiceTech: {
								AssignedUserRowId: 0,
								AssignedUserEmail: '',
								TypeaheadDisplay: '',
								IsNewContact: false,
							},
						};
						$scope.taskList.isAssignServiceTechOpen = false;
						$scope.taskList.isBulkActionsOpen = false;
					}

					angular.extend($scope, {
						supervisorRowId: 0,
						serviceTech: {
							AssignedUserRowId: 0,
							AssignedUserEmail: '',
							TypeaheadDisplay: '',
							ServiceTechRowId: 0,
							FirstName: '',
							LastName: '',
							DisplayName: '',
							IsBusiness: false,
							BusinessRowId: 0,
							BusinessName: '',
							IsSupervisor: false,
							IsNewContact: false,
						},
						post: {
							ServiceTech: {
								AssignedUserRowId: 0,
								AssignedUserEmail: '',
								TypeaheadDisplay: '',
								IsNewContact: false,
							},
						},
						suggestServiceTech: suggestServiceTech,
						typeaheadDisplayServiceTech: typeaheadDisplayServiceTech,
						checkUser: checkUser,
						assignServiceTech: assignServiceTech,
						serviceTechAssignment: serviceTechAssignment,
						cancelAssignServiceTech: cancelAssignServiceTech,
						resetAssignServiceTech: resetAssignServiceTech,
					});

				}],
    		link: function (scope, element, attrs, ctrl) {
    			scope.supervisorRowId = scope.$parent.otherSupervisors.isOtherSupervisorsQueue ? parseInt(scope.$parent.otherSupervisors.selectedSupervisorId) : parseInt(scope.$parent.authInfo.userRowId);
    		}
    	};
    }]);