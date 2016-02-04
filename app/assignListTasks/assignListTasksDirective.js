angular.module('myVillages.tasker.app.assignListTasks')
    .directive('tkAssignListTasks', [function () {
    	return {
    		restrict: 'AE',
    		scope: {
    			taskList: '=',
    			userToys: '='
    		},
    		templateUrl: '/Scripts/tasker/app/assignListTasks/assignListTasks.html',
    		controller: ['$scope', '$sce', 'userTaskDataService', 'dataService', 'taskStatus', 'userTaskEquipment', '$modal', 'modalService', 'linkedListType', '$q', '$window', '$filter', '$timeout',
				function ($scope, $sce, userTaskDataService, dataService, taskStatus, userTaskEquipment, $modal, modalService, linkedListType, $q, $window, $filter, $timeout) {
					function cancelBulkAssignUser() {
						resetAssignListTasks(false);
					}
					function suggestContact(searchKeyword) {
						return userTaskDataService.getSuggestedContacts(searchKeyword).then(function (results) {
							return results;
						});
					};

					function assignListUser(data) {
						// check if data is an object or a string
						if (typeof data === 'object') {
							$scope.taskPost.AssignedUserRowId = data.AssignedUserRowId;
							$scope.taskPost.TypeaheadDisplay = data.TypeaheadDisplay;
							$scope.taskPost.DisplayName = data.DisplayName;
							$scope.taskPost.IsNewContact = false;
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
									$scope.taskPost = {
										AssignedUserRowId: result.AssignedUserRowId,
										AssignedUserEmail: result.EmailAddress,
										TypeaheadDisplay: result.TypeaheadDisplay,
										ToyRowId: $scope.taskPost.ToyRowId,
										SelectedToyEquipmentIdsList: $scope.taskPost.ActiveToyEquipmentIdsList,
										EquipmentPersistType: userTaskEquipment.EquipmentModified,
										IsRequestEstimateChecked: $scope.taskPost.IsRequestEstimateChecked,
										RequestedCompletionDate: $scope.taskPost.RequestedCompletionDate,
										ServiceTechRowId: null,
										FirstName: result.FirstName,
										LastName: result.LastName,
										DisplayName: result.DisplayName,
										IsBusiness: result.IsBusiness,
										BusinessRowId: result.BusinessRowId,
										BusinessName: result.BusinessName,
										IsSupervisor: result.IsSupervisor,
										IsNewContact: result.IsNewContact,
									}
								});
							}
						}
					}

					function getPromptsPromise() {
						var promptNoEquip = true;
						var promptPostGeneral = true;
						var doPost = true;

						if ($window.userPromptsUnsubscribed.indexOf('postusertasknotoyorequip') >= 0) {
							promptNoEquip = false;
						}
						if ($window.userPromptsUnsubscribed.indexOf('postusertaskgeneral') >= 0) {
							promptPostGeneral = false;
						}

						function promptEquip() {
						    var deferred = $q.defer();
						    if (promptNoEquip && $scope.userToys && $scope.userToys.length > 0 && !($scope.taskPost.ToyRowId || $scope.taskPost.ActiveToyEquipmentIdsList.length > 0)) {
								var modalOptions = {
									closeButtonText: 'No',
									actionButtonText: 'Yes',
									headerText: 'Are you sure you want to post this task?',
									bodyText: 'We noticed your task is not attached to any of your Stuff and/or Equipment. Are you sure you want to submit like this?'
								};
								modalService.showModal({}, modalOptions).then(function (result) {
									if (result) {
										if (result.StopPromptingMe) {
											userTaskDataService.saveStopBugginMePrompt('postusertasknotoyorequip');
										}
										if (!result.DialogResult) {
											doPost = false;
										}
									}
									deferred.resolve(doPost);
								});
							} else {
								deferred.resolve(doPost);
							}
							return deferred.promise;
						}

						function promptGeneral() {
							var deferred = $q.defer();
							if (doPost && promptPostGeneral) {
								var modalOptions = {
									closeButtonText: 'No',
									actionButtonText: 'Yes',
									headerText: 'Are you sure you want to post this task?',
									bodyText: 'You about to assign this task to a provider or another user to perform work. It will be considered an official request to have work done. Are you sure?'
								};
								modalService.showModal({}, modalOptions).then(function (result) {
									if (result) {
										if (result.StopPromptingMe) {
											userTaskDataService.saveStopBugginMePrompt('postusertaskgeneral');
										}
										if (!result.DialogResult) {
											doPost = false;
										}
									}
									deferred.resolve(doPost);
								});
							} else {
								deferred.resolve(doPost);
							}
							return deferred.promise;
						}

						return $q.all([promptEquip(), promptGeneral()]);
					}

					function assignSelectedTasks() {
						if ($scope.taskPost.IsNewContact) {
							// validate new user
							if ($scope.taskPost.AssignedUserRowId == null) {
								if ($scope.taskPost.FirstName == null || $scope.taskPost.FirstName.length == 0) {
									toastr.error('Please enter New Contact First Name');
									return false;
								}
								if ($scope.taskPost.LastName == null || $scope.taskPost.LastName.length == 0) {
									toastr.error('Please enter New Contact Last Name');
									return false;
								}
								if ($scope.taskPost.IsBusiness && ($scope.taskPost.BusinessName == null || $scope.taskPost.BusinessName.length == 0)) {
									toastr.error('Please enter New Contact Business Name');
									return false;
								}
								if ($scope.taskPost.IsBusiness && ($scope.taskPost.State == undefined || $scope.taskPost.State.length == 0)) {
									toastr.error('Please select New Contact State/Provice');
									return false;
								}
							}
							var assignedUser = {
								AssignedUserRowId: $scope.taskPost.AssignedUserRowId,
								EmailAddress: $scope.taskPost.AssignedUserEmail,
								FirstName: $scope.taskPost.FirstName,
								LastName: $scope.taskPost.LastName,
								IsBusiness: $scope.taskPost.IsBusiness,
								BusinessRowId: $scope.taskPost.BusinessRowId,
								BusinessName: $scope.taskPost.BusinessName,
								State: $scope.taskPost.State,
								IsSupervisor: $scope.taskPost.IsSupervisor,
								IsNewContact: $scope.taskPost.IsNewContact,
							};
							var promptsPromise = getPromptsPromise();
							promptsPromise.then(function (promptsPromiseResult) {
								if (promptsPromiseResult[0] && promptsPromiseResult[1]) {
									userTaskDataService.saveContact(assignedUser).then(function (result) {
										$scope.taskPost.AssignedUserRowId = result.RowId;
										_assignSelectedTasks($scope.taskList);
									});
								}
							});
						}
						else {
							var promptsPromise = getPromptsPromise();
							promptsPromise.then(function (promptsPromiseResult) {
								if (promptsPromiseResult[0] && promptsPromiseResult[1]) {
									_assignSelectedTasks($scope.taskList);
								}
							});
						}
					};

					function _assignSelectedTasks() {
						var assignTasks;
						var selectedTasks = _.where($scope.taskList.GroupTasks, { Selected: true });
						if ($scope.taskList.RowId == 0 || $scope.taskList.IsFolder) {
							assignTasks = $q.all(_.map(selectedTasks, function (task, index) {
								task.AssignedUserRowId = $scope.taskPost.AssignedUserRowId;
								task.Status = $scope.taskPost.IsRequestEstimateChecked ? taskStatus.PendingEstimate : taskStatus.Posted;
								task.IsStatusChange = true;
								task.IsBulkPost = true;
								task.TaskIndex = index;
								task.IsRequestEstimateChecked = $scope.taskPost.IsRequestEstimateChecked;
								task.RequestedCompletionDate = $scope.taskPost.RequestedCompletionDate;
								task.ToyRowId = $scope.taskPost.ToyRowId;
								task.SelectedToyEquipmentIdsList = $scope.taskPost.ActiveToyEquipmentIdsList;
								task.EquipmentPersistType = userTaskEquipment.EquipmentModified;
								return userTaskDataService.save(task).then(function (result) {
									$.extend(true, task, result);
								});
							}));
						}
						else {
							var taskListXref = {
								Title: $scope.taskList.Title,
								UserRowId: $scope.taskPost.AssignedUserRowId,
								ParentListRowId: $scope.taskList.RowId,
								LinkedListTypeId: linkedListType.ProviderList,
							};
							assignTasks = $scope.$parent.createLinkedList(taskListXref).then(function (result) {
								var childListRowId = result;
								return $q.all(_.map(selectedTasks, function (task, index) {
									task.UserTaskGroupRowId = childListRowId;
									task.AssignedUserRowId = $scope.taskPost.AssignedUserRowId;
									task.Status = $scope.taskPost.IsRequestEstimateChecked ? taskStatus.PendingEstimate : taskStatus.Posted;
									task.IsStatusChange = true;
									task.IsBulkPost = true;
									task.TaskIndex = index;
									task.IsRequestEstimateChecked = $scope.taskPost.IsRequestEstimateChecked;
									task.RequestedCompletionDate = $scope.taskPost.RequestedCompletionDate;
									task.ToyRowId = $scope.taskPost.ToyRowId;
									task.SelectedToyEquipmentIdsList = $scope.taskPost.ActiveToyEquipmentIdsList;
									task.EquipmentPersistType = userTaskEquipment.EquipmentModified;
									return userTaskDataService.save(task).then(function (result) {
										$.extend(true, task, result);
									});
								}));
							}, function (error) {
								toastr.error('Failed to create linked list');
								$scope.isClientTasksLoaded = true;
							});
						}
						$q.when(assignTasks).then(function (results) {
							$scope.taskList.IsMessagesLinked = true;
							$scope.taskList.IsClientLinkedList = true;
							$scope.taskList.ListProDisplayName = $scope.taskPost.DisplayName;
							resetAssignListTasks(true);
							toastr.success('Selected Tasks have been assigned.');
						});
					};

					function resetAssignListTasks(resetSelection) {
						$scope.taskPost = {
							AssignedUserRowId: null,
							AssignedUserEmail: '',
							TypeaheadDisplay: '',
							ToyRowId: null,
							ActiveToyEquipmentIdsList: [],
							IsRequestEstimate: false,
							IsRequestEstimateChecked: false,
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
						$scope.assignedUser = '';
						$scope.taskList.isAssignUserOpen = false;
						$scope.taskList.isBulkActionsOpen = false;
						if (resetSelection) {
							$scope.taskList.numSelected = 0;
							$scope.taskList.numNotAssigned = 0;
						}
						suggestContact('');
					}

					function dpOptions() {
						var options = {
							showWeeks: false
						}
						return options;
					}

					function openDatepicker($event) {
						$event.preventDefault();
						$event.stopPropagation();
						$scope.opened.openCompletionDate = !$scope.opened.openCompletionDate;
					};

					angular.extend($scope, {
						assignedUser: '',
						taskPost: {
							AssignedUserRowId: null,
							AssignedUserEmail: '',
							TypeaheadDisplay: '',
							ToyRowId: null,
							ActiveToyEquipmentIdsList: [],
							IsRequestEstimate: false,
							IsRequestEstimateChecked: false,
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
						},
						toyEquipment: [],
						opened: {
							openCompletionDate: false
						},
						cancelBulkAssignUser: cancelBulkAssignUser,
						suggestContact: suggestContact,
						assignListUser: assignListUser,
						assignSelectedTasks: assignSelectedTasks,
						_assignSelectedTasks: _assignSelectedTasks,
						resetAssignListTasks: resetAssignListTasks,
						openDatepicker: openDatepicker,
						dpOptions: dpOptions
					});

				}],
    		link: function (scope, element, attrs, ctrl) {
    		}
    	};
    }]);