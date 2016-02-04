angular.module('myVillages.tasker.app.userTask')
    .directive('tkUserTask', [function () {
    	return {
    		restrict: 'AE',
    		scope: {
    			userTask: '=',
    			userTaskGroup: '='
    		},
    		templateUrl: '/Scripts/tasker/app/userTask/userTask.html',
    		controller: ['$scope', '$rootScope', '$sce', 'userTaskDataService', 'userTaskDataServiceDM', 'userTaskOpsCodesDataServiceDM', 'userTaskServiceTechDataService', 'dataService', 'taskStatus', 'taskAction', 'linkedListType', 'userTaskEquipment', '$modal', 'modalService', '$q', '$window', '$filter', '$timeout', 'appStorage', '$cookieStore', '$element',
				function ($scope, $rootScope, $sce, userTaskDataService, userTaskDataServiceDM, userTaskOpsCodesDataServiceDM, userTaskServiceTechDataService, dataService, taskStatus, taskAction, linkedListType, userTaskEquipment, $modal, modalService, $q, $window, $filter, $timeout, appStorage, $cookieStore, $element) {
					$scope.rate = $scope.userTask.Rating;
					$scope.dmEndpoint = $scope.$parent.authInfo.dmEndpoint;
					$scope.isWorkOrderIntegrationEnabled = $scope.$parent.authInfo.isWorkOrderIntegrationEnabled;
					$scope.isWOCollapsed = true;
					$scope.isWOEnabled = isWorkOrderEnabled();
					$scope.isSampleTask = !$scope.userTask.RowId ? true : false;
					$scope.isMobile = $rootScope.isMobile;
					$scope.max = 5;
					$scope.hoveringOver = function (value) {
						$scope.overStar = value;
					};
					$scope.$watch('rate', function () {
						if ($scope.isSampleTask) return;
						if ($scope.userTask) {
							var taskRating = $scope.userTask.Rating || 0;
							if ($scope.rate != taskRating) {
								$scope.userTask.Rating = $scope.rate;
								userTaskDataService.persistTaskRating($scope.userTask.RowId, $scope.rate);
							}
						}
					});
					$scope.$watch('userTask.TaskTypeToken', function () {
						computeTaskTypeFlags();
					});

					computeTaskTypeFlags();

					$scope.isBusinessPremium = $scope.$parent.authInfo.userCategory == 'BusinessPremium';
					$scope.isBusinessSupervisor = $scope.isBusinessPremium && $scope.$parent.authInfo.isBusinessSupervisor;
					$scope.isBusinessServiceTech = $scope.isBusinessPremium && !$scope.$parent.authInfo.isBusinessSupervisor;
					$scope.isListOrTaskById = $scope.$parent.listOrTaskById.isTaskById || $scope.$parent.listOrTaskById.isListById;
					$scope.notesCustomerGroup = [{ title: $scope.isBusinessSupervisor ? "Customer Notes" : "Notes", open: false }];
					$scope.notesServiceTechGroup = [{ title: "Technician Notes", open: false }];
					$scope.notesSubcontractorGroup = [{ title: "Notes from " + $scope.userTask.AssignedUserDisplayName.split('|')[0], open: false }];
					$scope.feedbackGroup = [{ title: "Sharing & Feedback", open: false }];
					$scope.$watch('feedbackGroup', function (feedbackGroup) {
						if (feedbackGroup[0].open) {
							if ($scope.userTask.Feedbacks == undefined) {
								$scope.userTask.Feedbacks = [];
							}
							if ($scope.userTask.SharedWith == undefined) {
								$scope.userTask.SharedWith = [];
							}
							if ($scope.userTask.SharedWithChecked == undefined) {
								$scope.userTask.SharedWithChecked = false;
							}

							$scope.userTask.Feedbacks.length = 0;
							if ($scope.isSampleTask) return;
							userTaskDataService.getAllFeedback($scope.userTask.RowId).then(function (result) {
								$scope.userTask.Feedbacks = result;
							});

							if (!$scope.userTask.SharedWithChecked) {
								userTaskDataService.getAllUserSharedWith($scope.userTask.RowId).then(function (result) {
									$scope.userTask.SharedWithChecked = true;
									if (result && result.SharedWithUsers) {
										for (var i = 0; i < result.SharedWithUsers.length; i++) {
											var user = { RowId: result.SharedWithUsers[i].RowId, TypeaheadDisplay: result.SharedWithUsers[i].DisplayName };
											$scope.userTask.SharedWith.push(user);
										}
									}
								});
							}
						}
					}, true);

					if ($scope.isBusinessSupervisor || !$scope.isBusinessServiceTech) {
						$scope.$watch('notesCustomerGroup', function (notesCustomerGroup) {
							if (notesCustomerGroup[0].open) {
								if ($scope.userTask.CustomerNotes == undefined) {
									$scope.userTask.CustomerNotes = [];
								}
								$scope.userTask.CustomerNotes.length = 0;
								var userTaskNotesArgs = {
									UserTaskRowId: $scope.userTask.RowId,
									IsServiceTechNotes: false,
								};
								if ($scope.isSampleTask) return;
								userTaskDataService.getAllNotes(userTaskNotesArgs).then(function (result) {
									$scope.userTask.CustomerNotes = result;
								});
							}
						}, true);
					};

					if ($scope.userTask.TaskTypeToken == 'SubcontractorTask') {
						$scope.$watch('notesSubcontractorGroup', function (notesSubcontractorGroup) {
							if (notesSubcontractorGroup[0].open) {
								if ($scope.userTask.SubcontractorNotes == undefined) {
									$scope.userTask.SubcontractorNotes = [];
								}
								$scope.userTask.SubcontractorNotes.length = 0;
								var userTaskNotesArgs = {
									UserTaskRowId: $scope.userTask.RowId,
									SubcontractorRowId: $scope.viewingUserRowId,
									IsServiceTechNotes: false,
								};
								if ($scope.isSampleTask) return;
								userTaskDataService.getSubcontractorNotes(userTaskNotesArgs).then(function (result) {
									$scope.userTask.SubcontractorNotes = result;
									$scope.userTask.SubcontractorRowId = $scope.viewingUserRowId;
								});
							}
						}, true);
					};

					if ($scope.isBusinessSupervisor || $scope.isBusinessServiceTech) {
						$scope.$watch('notesServiceTechGroup', function (notesServiceTechGroup) {
							if (notesServiceTechGroup[0].open) {
								if ($scope.userTask.ServiceTechNotes == undefined) {
									$scope.userTask.ServiceTechNotes = [];
								}
								$scope.userTask.ServiceTechNotes.length = 0;
								var userTaskNotesArgs = {
									UserTaskRowId: $scope.userTask.RowId,
									SubcontractorRowId: $scope.userTask.SubcontractorRowId,
									IsServiceTechNotes: true,
								};
								if ($scope.isSampleTask) return;
								userTaskDataService.getAllNotes(userTaskNotesArgs).then(function (result) {
									$scope.userTask.ServiceTechNotes = result;
								});
							}
						}, true);
					};

					$scope.$watch('userTask.CurrentTaskStatus', function () {
						computeVisibleSettings();
					});

					function saveNotes(note, isTechNote) {
						if (note && !$scope.isSampleTask) {
							var userTaskNote = {
								Note: note,
								UserTaskRowId: $scope.userTask.RowId,
								SubcontractorRowId: isTechNote || $scope.isSubcontractorTask ? $scope.userTask.SubcontractorRowId : $scope.viewingUserRowId,
								IsTechNote: isTechNote,
							};
							userTaskDataService.saveNotes(userTaskNote).then(function (result) {
								if (result != null && result != undefined) {
									if (isTechNote) {
										$scope.userTask.ServiceTechNotes = result;
									} else {
										$scope.userTask.CustomerNotes = result;
									}
								}
							});
						}
					}

					function saveFeedbackComment(comment) {
						if (comment && !$scope.isSampleTask) {
							var obj = new MyVillages.TaskerApp.UserTaskFeedback();
							obj.Message = comment;
							obj.UserTaskRowId = $scope.userTask.RowId;
							obj.RowId = 0;
							obj.RowGuid = null;
							userTaskDataService.saveFeedback($scope.userTask.RowId, obj).then(function (result) {
								if (result != null && result != undefined) {
									$scope.userTask.Feedbacks.unshift(result);
								}
							});
						}

						$scope.feedbackComment = '';
					}

					function assignSharedUser(data) {
						if (!data || !data.AssignedUserRowId || $scope.isSampleTask) return;
						var found = $scope.userTask.SharedWith.some(function (e1) {
							return e1.RowId === data.AssignedUserRowId;
						});
						if (!found) {
							userTaskDataService.saveSharedWithUser($scope.userTask.RowId, data.AssignedUserRowId).then(function (result) {
								if (result != null && result != undefined) {
									var user = { RowId: result.RowId, TypeaheadDisplay: result.DisplayName };
									$scope.userTask.SharedWith.unshift(user);
								}
							});
						}
					}

					function unassignSharedUser(userRowId) {
						for (i = 0; i < $scope.userTask.SharedWith.length; i++) {
							if ($scope.userTask.SharedWith[i].RowId === userRowId) {
								userTaskDataService.saveUnSharedWithUser($scope.userTask.RowId, userRowId).then(function (result) {
									$scope.userTask.SharedWith.splice(i, 1);
								});
								break;
							}
						}
					}

					function toggleTaskDetails() {
						$scope.isCollapsed = !$scope.isCollapsed;
						if ($scope.userTaskGroup && $scope.userTaskGroup.Title === 'Sample Task List') {
							$scope.isRender = true;
							computeVisibleSettings();
							$scope.userToys = [
                                {
                                	CreatedBy: "0",
                                	CreatedByBusinessId: 129,
                                	CurrentLocationDisplayName: null,
                                	CurrentLocationId: null,
                                	DateCreated: "2015-11-10T22:42:40.523",
                                	DateDeactivated: null,
                                	DateLastMod: "2015-11-10T22:42:40.523",
                                	Description: " ArrowCat Express 30",
                                	DetailedEquipment: null,
                                	Details: null,
                                	Equipment: null,
                                	IsActive: true,
                                	IsArchived: null,
                                	IsDeleted: false,
                                	IsForPremium: false,
                                	IsPaymentCurrent: true,
                                	IsPremiumRegistered: true,
                                	IsRelativeToy: false,
                                	LastModBy: 3329,
                                	Lists: [],
                                	Manuals: null,
                                	OwnerId: "0",
                                	PremiumOnetimeSetupCharged: null,
                                	PremiumRegistrations: [],
                                	RowGuid: "614114f2-9402-4e5f-a653-1bbe90ba67b3",
                                	RowId: "sample_toy_id",
                                	SpareParts: [],
                                	SubscriptionToyXrefs: [],
                                	SystemTypes: [],
                                	ToyBusinessXrefs: [],
                                	ToyImage: "/images/no_toy_image.png",
                                	ToyInsuranceXrefs: [],
                                	ToyName: "Sample Boat",
                                	ToyNotes: [],
                                	ToyTypeId: 1,
                                	ToyYachtDetails: [],
                                	TripLogs: [],
                                	UserReminders: [],
                                	UserTasks: []
                                }
							];
							$scope.taskPost.ActiveToyEquipmentIdsList = $scope.userTask.ActiveToyEquipmentIdsList;
							return;
						}
						if ($scope.isWOEnabled) {
							$scope.isWOCollapsed = true;
						}
						if (!$scope.isCollapsed) {
							var userTask = {
								RowId: $scope.userTask.RowId,
								ViewingUserRowId: $scope.viewingUserRowId,
							};
							userTaskDataService.getUserTaskByViewingUser(userTask).then(function (result) {
								if (result) {
									$timeout(function () {
										// get the service techs and their statuses if the logged in user is a business supervisor
										if (($scope.isClientTask && $scope.isVisible.isBusinessSupervisor) || $scope.isSubcontractorTask) {
											getClientStuff();
											userTaskServiceTechDataService.getAll({ id: $scope.userTask.RowId }).then(function (result) {
												$scope.userTask.userTaskServiceTechs = result;
											});
											userTaskDataService.getAllSubcontractors({ id: $scope.userTask.RowId }).then(function (result) {
												$scope.userTask.userTaskSubcontractors = result;
											});
										}
										$.extend(true, $scope.userTask, result);
										computeVisibleSettings();
										$scope.isRender = true;
										$scope.taskPost.ActiveToyEquipmentIdsList = result.ActiveToyEquipmentIdsList;
									});
								}
							});
						}
					};

					$rootScope.$on('event:refreshUserTask', function (event, args) {
						if (args.userTask) {
							$timeout(function () {
								if (args.userTask.RowId === $scope.userTask.RowId) $scope.userTask = args.userTask;
							});
						}
					});

					function getUserTaskMessages() {
						if ($scope.isSampleTask) { return; }
						var searchArgs = {
							ParentRowId: $scope.userTask.RowId,
							ParentType: 1, // user task messages
						};
						$scope.$broadcast('loadMessages', searchArgs);
						$scope.userTask.isMessagesOpen = !$scope.userTask.isMessagesOpen;
					};

					$scope.$on('messagesLength', function (e, args) {
						if (args.ParentRowId == $scope.userTask.RowId && args.ParentType == 1) {
							$scope.userTask.MessagesCount = args.MessagesCount;
						}
					});

					function typeaheadDisplayUser(data) {
						var display = '';
						if (data != null && typeof data === 'object') {
							display = data.TypeaheadDisplay;
						}
						else {
							display = data;
						}
						return display;
					}

					function typeaheadDisplayServiceTech(data) {
						var display = '';
						if (data == undefined || data == null || $scope.userTask.ServiceTech == null) {
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

					function typeaheadDisplaySubcontractor(data) {
						var display = '';
						if (data == undefined || data == null || $scope.userTask.Subcontractor == null) {
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
							$scope.taskPost.AssignedUserRowId = data.AssignedUserRowId;
							$scope.taskPost.TypeaheadDisplay = data.TypeaheadDisplay;
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
										UserTaskRowId: $scope.userTask.RowId,
										AssignedUserRowId: result.AssignedUserRowId,
										AssignedUserEmail: result.EmailAddress,
										TypeaheadDisplay: result.TypeaheadDisplay,
										ToyRowId: $scope.taskPost.ToyRowId,
										ActiveToyEquipmentIdsList: $scope.taskPost.ActiveToyEquipmentIdsList,
										IsRequestEstimate: $scope.taskPost.IsRequestEstimate,
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

					function assignCompleteUser(data) {
						if ($scope.isSampleTask) { return; }
						// check if data is an object or a string
						if (typeof data === 'object') {
							$scope.completeTask.AssignedUserRowId = data.AssignedUserRowId;
							$scope.completeTask.TypeaheadDisplay = data.TypeaheadDisplay;
							$scope.completeTask.IsNewContact = false;
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
									$scope.completeTask = {
										UserTaskRowId: $scope.userTask.RowId,
										AssignedUserRowId: result.AssignedUserRowId,
										AssignedUserEmail: result.EmailAddress,
										TypeaheadDisplay: result.TypeaheadDisplay,
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

					function assignServiceTech() {
						if ($scope.isSampleTask) { return; }
						var userTaskServiceTechXref = {
							UserTaskRowId: $scope.userTask.RowId,
							UserTaskTitle: $scope.userTask.Title,
							AssignedBy: $scope.viewingUserRowId,
							ServiceTechRowId: $scope.taskPost.AssignedUserRowId,
							ServiceTechEmail: $scope.taskPost.AssignedUserEmail,
						};
						userTaskDataService.assignServiceTech(userTaskServiceTechXref).then(function (result) {
							if (result == null) {
								toastr.error('Service Tech already assigned');
							}
							else {
								$.extend(true, $scope.userTask, result);
								computeVisibleSettings();
								userTaskServiceTechDataService.getAll({ id: $scope.userTask.RowId }).then(function (result) {
									$scope.taskPost = {
										UserTaskRowId: $scope.userTask.RowId,
										AssignedUserRowId: null,
										AssignedUserEmail: '',
										TypeaheadDisplay: '',
										ToyRowId: null,
										ActiveToyEquipmentIdsList: [],
										IsRequestEstimate: false,
										RequestedCompletionDate: null,
										ServiceTechRowId: null,
										FirstName: '',
										LastName: '',
										DisplayName: '',
										IsBusiness: false,
										BusinessRowId: null,
										BusinessName: '',
										State: '',
										IsSupervisor: false,
										IsNewContact: false,
									};
									$scope.userTask.ServiceTech = null;
									$scope.userTask.userTaskServiceTechs = result;
									toastr.success('Service Tech has been assigned');
								});
							}
						});
					}

					function removeServiceTech(xrefRowId) {
						if ($scope.isSampleTask) { return; }
						var userTaskServiceTechXref = {
							RowId: xrefRowId,
							UserTaskRowId: $scope.userTask.RowId,
							AssignedBy: $scope.viewingUserRowId,
						};
						userTaskDataService.removeServiceTech(userTaskServiceTechXref).then(function (result) {
							$.extend(true, $scope.userTask, result);
							userTaskServiceTechDataService.getAll({ id: $scope.userTask.RowId }).then(function (result) {
								$scope.userTask.userTaskServiceTechs = result;
							});
							toastr.success('Service Tech has been removed');
						});
					}

					function assignSubcontractor() {
						if ($scope.isSampleTask) { return; }
						var userTaskSubcontractorXref = {
							UserTaskRowId: $scope.userTask.RowId,
							UserTaskTitle: $scope.userTask.Title,
							AssignedBy: $scope.viewingUserRowId,
							SubcontractorRowId: $scope.userTask.Subcontractor.RowId,
						};
						userTaskDataService.assignSubcontractor(userTaskSubcontractorXref).then(function (result) {
							if (result == null) {
								toastr.error('Subcontractor already assigned');
							}
							else {
								$.extend(true, $scope.userTask, result);
								computeVisibleSettings();
								userTaskDataService.getAllSubcontractors({ id: $scope.userTask.RowId }).then(function (result) {
									$scope.userTask.Subcontractor = null;
									$scope.userTask.userTaskSubcontractors = result;
									toastr.success('Subcontractor has been assigned');
								});
							}
						});
					}

					function removeSubcontractor(xrefRowId) {
						var userTaskSubcontractorXref = {
							RowId: xrefRowId,
							UserTaskRowId: $scope.userTask.RowId,
							AssignedBy: $scope.viewingUserRowId,
						};
						userTaskDataService.removeSubcontractor(userTaskSubcontractorXref).then(function (result) {
							$.extend(true, $scope.userTask, result);
							userTaskDataService.getAllSubcontractors({ id: $scope.userTask.RowId }).then(function (result) {
								$scope.userTask.userTaskSubcontractors = result;
							});
							toastr.success('Subcontractor has been removed');
						});
					}

					function viewSubcontractorNotes(subcontractor) {
						if (!subcontractor.isNotesVisible) {
							var userTaskNotesArgs = {
								UserTaskRowId: $scope.userTask.RowId,
								SubcontractorRowId: subcontractor.SubcontractorRowId,
								IsServiceTechNotes: false,
							};
							userTaskDataService.getSubcontractorNotes(userTaskNotesArgs).then(function (result) {
								subcontractor.SubcontractorNotes = result;
								subcontractor.isNotesVisible = true;
							});
						}
						else {
							subcontractor.SubcontractorNotes = [];
							subcontractor.isNotesVisible = false;
						}
					}

					function saveSubcontractorNote(subcontractor) {
						if ($scope.isSampleTask) return;
						if (!subcontractor.note) {
							toastr.error('Please enter Note');
							return false;
						}
						var userTaskNote = {
							UserTaskRowId: $scope.userTask.RowId,
							SubcontractorRowId: subcontractor.SubcontractorRowId,
							Note: subcontractor.note,
							IsTechNote: false,
						};
						userTaskDataService.saveSubcontractorNote(userTaskNote).then(function (result) {
							subcontractor.SubcontractorNotes = result;
							subcontractor.note = '';
						});
					}

					function completeUserTask() {
						var status = 'Completed';
						if ($scope.isServiceTechTask) {
							status = 'ServiceTechCompleted';
						}
						else if ($scope.isSubcontractorTask) {
							status = 'SubcontractorCompleted';
						}
						updateUserTaskStatus(status);
					}

					function dpOptions() {
						var options = {
							showWeeks: false
						}
						return options;
					}

					function postUserTask() {
						if ($scope.$parent.isPremiumFeature($scope.userTask.TaskTypeToken) || $scope.isSampleTask) { return false; }

						var promptNoEquip = true;
						var promptPostGeneral = true;
						var doPost = true;

						if ($window.userPromptsUnsubscribed.indexOf('postusertasknotoyorequip') >= 0) {
							promptNoEquip = false;
						}
						if ($window.userPromptsUnsubscribed.indexOf('postusertaskgeneral') >= 0) {
							promptPostGeneral = false;
						}

						if ($scope.userTask.ToyRowId) {
							$scope.taskPost.ToyRowId = $scope.userTask.ToyRowId;
						}

						if ($scope.userTask.IsToyEquipment) {
							$scope.taskPost.ActiveToyEquipmentIdsList = $scope.userTask.ActiveToyEquipmentIdsList;
						}

						function promptEquip() {
							return function () {
								var deferred = $q.defer();
								if (promptNoEquip && $scope.userToys && $scope.userToys.length > 0 && !$scope.taskPost.ToyRowId) {
									var modalOptions = {
										closeButtonText: 'No',
										actionButtonText: 'Yes',
										headerText: 'Are you sure you want to post this task?',
										bodyText: 'We noticed your task is not attached to any of YourStuff and/or equipment. Are you sure you want to submit like this?'
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
										deferred.resolve();
									});
								} else {
									deferred.resolve();
								}
								return deferred.promise;
							}
						}

						function promptGeneral() {
							return function () {
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
										deferred.resolve();
									});
								} else {
									deferred.resolve();
								}
								return deferred.promise;
							}
						}

						var deferred = $q.defer();
						var p = deferred.promise;
						p = p.then(promptEquip());
						p = p.then(promptGeneral());

						p.then(function () {
							if (doPost) {
								_postUserTask();
								return true;
							}
						});

						deferred.resolve();
					};

					function _postUserTask() {
						// validate new user
						if ($scope.taskPost.IsNewContact && $scope.taskPost.AssignedUserRowId == null) {
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
							IsNewContact: $scope.taskPost.IsNewContact,
							AssignedUserRowId: $scope.taskPost.AssignedUserRowId,
							EmailAddress: $scope.taskPost.AssignedUserEmail,
							FirstName: $scope.taskPost.FirstName,
							LastName: $scope.taskPost.LastName,
							IsBusiness: $scope.taskPost.IsBusiness,
							BusinessRowId: $scope.taskPost.BusinessRowId,
							BusinessName: $scope.taskPost.BusinessName,
							State: $scope.taskPost.State,
							IsSupervisor: $scope.taskPost.IsSupervisor,
							Country: $scope.taskPost.Country
						};
						$scope.userTask.AssignedUser = assignedUser;
						$scope.userTask.AssignedUserRowId = $scope.taskPost.AssignedUserRowId;
						$scope.userTask.IsRequestEstimateChecked = $scope.taskPost.IsRequestEstimateChecked;
						$scope.userTask.RequestedCompletionDate = $scope.taskPost.RequestedCompletionDate;
						$scope.userTask.SelectedToyEquipmentIdsList = $scope.userTask.ActiveToyEquipmentIdsList;
						$scope.userTask.EquipmentPersistType = userTaskEquipment.EquipmentModified;
						$scope.userTask.Status = $scope.taskPost.IsRequestEstimateChecked ? taskStatus.PendingEstimate : taskStatus.Posted;
						$scope.userTask.IsStatusChange = true;
						updateUserTask('Task has been posted').then(function () {
							$scope.taskPost = {
								UserTaskRowId: $scope.userTask.RowId,
								AssignedUserRowId: null,
								AssignedUserEmail: '',
								TypeaheadDisplay: '',
								ToyRowId: null,
								ActiveToyEquipmentIdsList: [],
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
							$scope.$broadcast('userTaskPosted', { toyRowId: $scope.userTask.ToyRowId });
						});
					};

					function submitEstimate() {
						if ($scope.$parent.isPremiumFeature($scope.userTask.TaskTypeToken) || $scope.isSampleTask) { return false; }
						$scope.userTask.Status = taskStatus.AwaitingApproval;
						$scope.userTask.IsStatusChange = true;
						updateUserTask('Estimate has been submitted');
					};

					function approveEstimate() {
						if ($scope.$parent.isPremiumFeature($scope.userTask.TaskTypeToken) || $scope.isSampleTask) { return false; }
						var userTask = $scope.userTask;
						userTask.Status = taskStatus.EstimateApproved;
						updateUserTask('Task estimate has been approved');
					};

					function rejectEstimate() {
						if ($scope.$parent.isPremiumFeature($scope.userTask.TaskTypeToken) || $scope.isSampleTask) { return false; }
						var userTask = $scope.userTask;
						userTask.Status = taskStatus.Cancelled;
						updateUserTask('Task estimate has been rejected.');
					};

					function saveInProgressReason() {
						if ($scope.$parent.isPremiumFeature($scope.userTask.TaskTypeToken) || $scope.isSampleTask) { return false; }
						$scope.userTask.ServiceTechReason = $scope.userTask.ReasonModel.Key;
						$scope.userTask.Reason = $scope.userTask.ReasonModel.Key;
						var reason = $scope.userTask.ReasonModel.Value;
						$scope.userTask.ReasonDescription = reason;
						updateUserTask('Reason has been updated').then(function () {
							$scope.userTask.ReasonDescription = reason;
							$scope.isVisible.isInProgressReason = reason != 'Select Reason';
						});
					};

					function updateUserTaskTitle(newTitle) {
						if ($scope.$parent.isPremiumFeature($scope.userTask.TaskTypeToken) || $scope.isSampleTask) { return false; }
						var userTaskUpdated = $.extend({}, $scope.userTask, { 'Title': newTitle });
						userTaskUpdated.ViewingUserRowId = $scope.viewingUserRowId;
						return userTaskDataService.save(userTaskUpdated).then(function (result) {
							toastr.success('Task title has been updated');
						});
					};

					function updateUserTask(prompt) {
						if ($scope.$parent.isPremiumFeature($scope.userTask.TaskTypeToken) || $scope.isSampleTask) { return false; }
						$scope.userTask.ViewingUserRowId = $scope.viewingUserRowId;
						return userTaskDataService.save($scope.userTask).then(function (result) {
							$.extend(true, $scope.userTask, result);
							computeVisibleSettings();
							toastr.success(prompt);
						});
					};

					function deleteUserTask() {
						if ($scope.isSampleTask) {
							$scope.$broadcast('event:deleteSampleTask', { userTask: $element });
							return;
						}
						if ($scope.$parent.isPremiumFeature($scope.userTask.TaskTypeToken)) { return false; }
						bootbox.confirm("Are you sure you want to delete this Task?", function (result) {
							if (result) {
								userTask = {
									RowId: $scope.userTask.RowId,
									ViewingUserRowId: $scope.viewingUserRowId,
								};
								userTaskDataService.remove(userTask).then(function (result) {
									toastr.success('Task has been deleted');
									$scope.$parent.removeTaskFromList($scope.userTask, taskAction.DeleteTask);
								})
							}
						});
					};

					function updateUserTaskStatus(status) {
						if ($scope.$parent.isPremiumFeature($scope.userTask.TaskTypeToken) || $scope.isSampleTask) { return false; }
						var statusArgs = {
							status: status,
							confirmPrompt: '',
							successPrompt: '',
							action: null,
							completedBy: $scope.viewingUserRowId,
							completeDate: new Date(),
						};
						switch (status) {
							case 'Completed':
								statusArgs.confirmPrompt = 'Are you sure you want to mark this Task as Completed?';
								statusArgs.successPrompt = 'Task has been completed';
								statusArgs.action = taskAction.CompleteTask;
								statusArgs.completedBy = $scope.completeTask.AssignedUserRowId == null ? statusArgs.completedBy : $scope.completeTask.AssignedUserRowId;
								statusArgs.completeDate = $scope.completeTask.CompleteDate == null ? statusArgs.completeDate : $scope.completeTask.CompleteDate;
								break;
							case 'Cancelled':
								statusArgs.confirmPrompt = 'Are you sure you want to Cancel this Task?';
								statusArgs.successPrompt = 'Task has been cancelled';
								statusArgs.action = taskAction.CancelTask;
								break;
							case 'EstimateApproved':
								statusArgs.confirmPrompt = '';
								statusArgs.successPrompt = 'Estimate has been approved';
								statusArgs.action = taskAction.ApproveEstimate;
								break;
							case 'Approved':
								statusArgs.confirmPrompt = '';
								statusArgs.successPrompt = 'Task has been approved';
								statusArgs.action = taskAction.ApproveTask;
								break;
							case 'EstimateRejected':
								statusArgs.confirmPrompt = 'Are you sure you want to Reject this Estimate?';
								statusArgs.successPrompt = 'Estimate has been rejected';
								statusArgs.action = taskAction.RejectEstimate;
								break;
							case 'InProgress':
								statusArgs.confirmPrompt = '';
								statusArgs.successPrompt = 'Work on the Task has started';
								statusArgs.action = taskAction.StartTask;
								break;
							case 'ServiceTechInProgress':
								statusArgs.confirmPrompt = '';
								statusArgs.successPrompt = 'Work on the Task has started';
								statusArgs.action = taskAction.ServiceTechStartTask;
								break;
							case 'ServiceTechCompleted':
								statusArgs.confirmPrompt = 'Are you sure you want to mark this Task as Completed?';
								statusArgs.successPrompt = 'Task has been completed';
								statusArgs.action = taskAction.ServiceTechCompleteTask;
								statusArgs.completeDate = $scope.completeTask.CompleteDate == null ? statusArgs.completeDate : $scope.completeTask.CompleteDate;
								break;
							case 'SubcontractorInProgress':
								statusArgs.confirmPrompt = '';
								statusArgs.successPrompt = 'Work on the Task has started';
								statusArgs.action = taskAction.SubcontractorStartTask;
								break;
							case 'SubcontractorCompleted':
								statusArgs.confirmPrompt = 'Are you sure you want to mark this Task as Completed?';
								statusArgs.successPrompt = 'Task has been completed';
								statusArgs.action = taskAction.SubcontractorCompleteTask;
								break;
						}
						if ($scope.completeTask.IsNewContact) {
							// validate new user
							if ($scope.completeTask.AssignedUserRowId == null) {
								if ($scope.completeTask.FirstName == null || $scope.completeTask.FirstName.length == 0) {
									toastr.error('Please enter New Contact First Name');
									return false;
								}
								if ($scope.completeTask.LastName == null || $scope.completeTask.LastName.length == 0) {
									toastr.error('Please enter New Contact Last Name');
									return false;
								}
								if ($scope.completeTask.IsBusiness && ($scope.completeTask.BusinessName == null || $scope.completeTask.BusinessName.length == 0)) {
									toastr.error('Please enter New Contact Business Name');
									return false;
								}
								if ($scope.completeTask.IsBusiness && ($scope.completeTask.State == undefined || $scope.completeTask.State.length == 0)) {
									toastr.error('Please select New Contact State/Provice');
									return false;
								}
							}
							var assignedUser = {
								AssignedUserRowId: $scope.completeTask.AssignedUserRowId,
								EmailAddress: $scope.completeTask.AssignedUserEmail,
								FirstName: $scope.completeTask.FirstName,
								LastName: $scope.completeTask.LastName,
								IsBusiness: $scope.completeTask.IsBusiness,
								BusinessRowId: $scope.completeTask.BusinessRowId,
								BusinessName: $scope.completeTask.BusinessName,
								State: $scope.completeTask.State,
								IsSupervisor: $scope.completeTask.IsSupervisor,
								IsNewContact: $scope.completeTask.IsNewContact,
							};
							userTaskDataService.saveContact(assignedUser).then(function (result) {
								$scope.completeTask.AssignedUserRowId = result.RowId;
								statusArgs.completedBy = result.RowId;
								_updateUserTaskStatus(statusArgs)
							});
						}
						else {
							_updateUserTaskStatus(statusArgs)
						}
					}

					function _updateUserTaskStatus(statusArgs) {
						var userTaskStatus = {
							UserTaskRowId: $scope.userTask.RowId,
							Status: taskStatus[statusArgs.status],
							StatusChangeDate: statusArgs.completeDate,
							CreatedBy: statusArgs.completedBy,
							ServiceTechRowId: (statusArgs.status == 'ServiceTechInProgress' || statusArgs.status == 'ServiceTechCompleted') ? $scope.viewingUserRowId : null,
							SubcontractorRowId: (statusArgs.status == 'SubcontractorInProgress' || statusArgs.status == 'SubcontractorCompleted') ? $scope.viewingUserRowId : null,
							ViewingUserRowId: $scope.viewingUserRowId,
						};
						if (statusArgs.confirmPrompt == '') {
							userTaskDataService.updateStatus(userTaskStatus).then(function (result) {
								var workOrderId = null;
								if ($scope.userTask.WorkOrderId !== null) {
									workOrderId = $scope.userTask.WorkOrderId;
								}
								$.extend(true, $scope.userTask, result);
								if (workOrderId !== null) {
									$scope.userTask.WorkOrderId = workOrderId;
								}
								computeVisibleSettings();
								toastr.success(statusArgs.successPrompt);
							});
						}
						else {
							bootbox.confirm(statusArgs.confirmPrompt, function (result) {
								if (result) {
									userTaskDataService.updateStatus(userTaskStatus).then(function (result) {
										$scope.$parent.removeTaskFromList($scope.userTask, statusArgs.action);
										toastr.success(statusArgs.successPrompt);
									});
								}
							});
						}
					};

					function saveUserTaskNotes() {
						if ($scope.$parent.isPremiumFeature($scope.userTask.TaskTypeToken) || $scope.isSampleTask) { return false; }
						updateUserTask('Task notes have been updated');
					};

					function getSampleToyEquipment() {
						$scope.toyEquipment = [
							{
								"LastLoggedUsageDisplay": "",
								"LastUsageDisplayDate": "",
								"InServiceDisplayDate": "",
								"OutOfServiceDisplayDate": "",
								"ManufacturerNameShortened": "Perkins",
								"StatusClassing": "",
								"AttentionClassing": "",
								"StatusDisplay": "",
								"IsPastDue": false,
								"IsComingUp": false,
								"ToyNameShortened": "Test Boat 1",
								"EquipmentNameShortened": "Auxillary Engine",
								"EquipmentTypeNameShortened": "Engine",
								"EquipmentSubTypeNameShortened": "",
								"AcceptsMeasurement": true,
								"ReferenceName": "Aux Engine",
								"ToyEquipmentRowId": 4088,
								"ToyRowId": 2257,
								"EquipmentRowId": 15766,
								"EquipmentRowGuid": "61766f4f-6a96-4efb-93a7-3fecbcfe775b",
								"InServiceDate": null,
								"OutOfServiceDate": null,
								"LastServiceDate": null,
								"SerialNumber": "",
								"Year": null,
								"Notes": "",
								"EquipmentTypeRowId": 2,
								"EquipmentSubTypeRowId": -1,
								"ToyName": "Test Boat 1",
								"EquipmentName": "Auxillary Engine",
								"EquipmentTypeName": "Engine",
								"EquipmentSubTypeName": "",
								"Hours": 0,
								"ManufacturerName": "Perkins",
								"ManufacturerRowId": 15,
								"NextServiceDisplay": "",
								"NextServiceDate": null,
								"Make": "",
								"Model": "4-154",
								"ExecutedDate": null,
								"ExecutedMeasurement": null,
								"MeasurementTypeId": null,
								"MeasurementTypeDisplay": null,
								"Status": -1,
								"IsUpcoming": false,
								"IsOverDue": false,
								"IsInServiceRequest": false,
								"ServiceRequestId": null,
								"DisplayImage": "",
								"LinkedMediaDisplayImageRowId": -1
							},
							{
								"LastLoggedUsageDisplay": "",
								"LastUsageDisplayDate": "",
								"InServiceDisplayDate": "",
								"OutOfServiceDisplayDate": "",
								"ManufacturerNameShortened": "Manufacturer",
								"StatusClassing": "",
								"AttentionClassing": "",
								"StatusDisplay": "",
								"IsPastDue": false,
								"IsComingUp": false,
								"ToyNameShortened": "Test Boat 1",
								"EquipmentNameShortened": "Vessel",
								"EquipmentTypeNameShortened": "Vessel",
								"EquipmentSubTypeNameShortened": "",
								"AcceptsMeasurement": false,
								"ReferenceName": "Test Boat 1",
								"ToyEquipmentRowId": 4087,
								"ToyRowId": 2257,
								"EquipmentRowId": -101,
								"EquipmentRowGuid": null,
								"InServiceDate": null,
								"OutOfServiceDate": null,
								"LastServiceDate": null,
								"SerialNumber": null,
								"Year": null,
								"Notes": "",
								"EquipmentTypeRowId": 1,
								"EquipmentSubTypeRowId": -1,
								"ToyName": "Test Boat 1",
								"EquipmentName": "Vessel",
								"EquipmentTypeName": "Vessel",
								"EquipmentSubTypeName": "",
								"Hours": 0,
								"ManufacturerName": "Manufacturer",
								"ManufacturerRowId": -1,
								"NextServiceDisplay": "",
								"NextServiceDate": null,
								"Make": "",
								"Model": "Model",
								"ExecutedDate": null,
								"ExecutedMeasurement": null,
								"MeasurementTypeId": null,
								"MeasurementTypeDisplay": null,
								"Status": -1,
								"IsUpcoming": false,
								"IsOverDue": false,
								"IsInServiceRequest": false,
								"ServiceRequestId": null,
								"DisplayImage": "",
								"LinkedMediaDisplayImageRowId": -1
							}
						];
					};

					function suggestContact(searchKeyword) {
						return userTaskDataService.getSuggestedContacts(searchKeyword).then(function (results) {
							return results;
						});
					};

					function suggestServiceTech(searchKeyword) {
						return userTaskDataService.getSuggestedServiceTechs(searchKeyword).then(function (results) {
							return results;
						});
					};

					function suggestServiceTechDm(searchKeyword) {
						return userTaskDataService.getSuggestedServiceTechsDm(searchKeyword).then(function (results) {
							return results;
						});
					};

					function suggestSubcontractor(searchKeyword) {
						return userTaskDataService.getSuggestedSubcontractor(searchKeyword).then(function (results) {
							return results;
						});
					};

					function getSubcontractorsList() {
						return userTaskDataService.getSubcontractorsList($scope.viewingUserRowId).then(function (results) {
							return results;
						});
					};

					function saveUserTaskTag(userTask, userTaskTag) {
						if ($scope.$parent.isPremiumFeature($scope.userTask.TaskTypeToken) || $scope.isSampleTask) { return false; }
						userTaskTag.UserTaskRowId = userTask.RowId;
						dataService.add('UserTaskTag', userTaskTag, {}).then(function (result) {
							userTaskTag.RowId = result.RowId;
						});
					};

					function deleteUserTaskTag(userTaskTag) {
						if ($scope.$parent.isPremiumFeature($scope.userTask.TaskTypeToken) || $scope.isSampleTask) { return false; }
						dataService.remove('UserTaskTag', userTaskTag.RowId).then(function (result) {
						})
					};

					function openDatepicker($event, elementOpened) {
						$event.preventDefault();
						$event.stopPropagation();
						$scope.opened[elementOpened] = !$scope.opened[elementOpened];
					};

					function renderHtml(html_code) {
						return $sce.trustAsHtml(html_code);
					};

					function toggleSelected(userTask, userTaskGroup) {
						$scope.userTask.Selected = !$scope.userTask.Selected;
						$scope.$parent.$emit('TaskSelectionChange', { userTask: $scope.userTask, userTaskGroup: userTaskGroup });
					};

					function toggleReminder(userTask) {
						if ($scope.isSampleTask) return;
						// toggle isReminderOpen property
						userTask.isReminderOpen = !userTask.isReminderOpen;

						// defaults
						if (!userTask.alarm) userTask.alarm = {};
						userTask.alarm.type = 'None';
					};

					function toggleQuickNotes(userTask) {
						if ($scope.isSampleTask) return;
						// toggle isQuickNotesOpen property
						userTask.isQuickNotesOpen = !userTask.isQuickNotesOpen
					};

					$scope.addFrequencyToReminder = function (frequency) {
						if (!frequency) return;
						if ('RecurrenceTypeId' in frequency && frequency.RecurrenceTypeId) frequency.RecurrenceTypeId = parseInt(frequency.RecurrenceTypeId);
						else return;
						if ('FrequencyTypeId' in frequency && frequency.FrequencyTypeId) frequency.FrequencyTypeId = parseInt(frequency.FrequencyTypeId);
						else return;
						if ('ConditionTypeId' in frequency && frequency.ConditionTypeId) frequency.ConditionTypeId = parseInt(frequency.ConditionTypeId);
						else frequency.ConditionTypeId = 2; // default to 2 ('Or')

						if (!$scope.userTask.alarm.Frequencies) $scope.userTask.alarm.Frequencies = [];
						$scope.userTask.alarm.Frequencies.push(frequency);
						$scope.userTask.reminderFrequenciesForm.$setValidity('freqmin', true);
						$scope.Frequency = null;
					};

					$scope.addStepToReminder = function (step) {
						if (!step || !('Details' in step) || !step.Details) return;
						if (!$scope.userTask.alarm.Templates) $scope.userTask.alarm.Templates = [];
						$scope.userTask.alarm.Templates.push(step.Details);
						$scope.Step = null;
					};

					$scope.setReminder = function (reminder) {
						$scope.$broadcast('show-errors-check-validity');

						if (reminder.Type == 'Recurring') {
							if (!reminder || !('Frequencies' in reminder) || !reminder.Frequencies || !('length' in reminder.Frequencies) || reminder.Frequencies.length <= 0) {
								$scope.userTask.reminderFrequenciesForm.$setValidity('freqmin', false);
								return undefined;
							} else {
								$scope.userTask.reminderFrequenciesForm.$setValidity('freqmin', true);
							}
						}

						if ($scope.userTask.reminderFromTaskForm.$valid && $scope.userTask.reminderFrequenciesForm.$valid) {
							$scope.$broadcast('show-errors-reset');
							if (reminder.Frequencies) {
								for (var i = 0; i < reminder.Frequencies.length; i++) {
									if (reminder.Frequencies[i].RecurrenceTypeId == 3) {
										reminder.Frequencies[i].FrequencyNumber = 0;
										reminder.Frequencies[i].FrequencyTypeId = 7;
									}
								}
							}
							var payload = {
								UserRowId: parseInt($scope.viewingUserRowId),
								Title: reminder.Title,
								Description: reminder.Description,
								DueDate: reminder.DueDate,
								Templates: reminder.Templates,
								Frequencies: reminder.Frequencies,
								ToyRowId: $scope.userTask.ToyRowId,
								ToyEquipmentRowId: !$scope.userTask.ActiveToyEquipmentIdsList || ($scope.userTask.ActiveToyEquipmentIdsList.length == 0) ? null : $scope.userTask.ActiveToyEquipmentIdsList[0],
								GuidelineRowId: null,
								GuidelineVersion: null
							};
							dataService.add('UserReminders', payload).then(function (result) {
								$scope.userTask.isReminderOpen = !$scope.userTask.isReminderOpen;
								toastr.success('Reminder has been set.');
							});
						}
					};

					$scope.convertTaskToWorkOrder = function (task, taskGroup) {
						if ($scope.isSampleTask) return;
						$scope.isWOCollapsed = !$scope.isWOCollapsed;
						$scope.isCollapsed = true;
						$scope.userTask.IsWorkOrder = true;
						$scope.userTask.FirstOpCode = null;
						getWorkOrderLookups();
					};

					$scope.cancelConvertToWorkOrder = function () {
						$scope.isWOCollapsed = !$scope.isWOCollapsed;
						$('.selectpicker').selectpicker('deselectAll');
					};

					function isWorkOrderEnabled() {
						var enabled = $scope.userTask.IntegrationKey !== null
                                      && $scope.userTask.IntegrationKey !== ''
                                      && !$scope.userTask.Opcode
                                      && isWorkOrderIntegrationEnabled === 'True'
                                      && !_.isUndefined(dmEndpoint)
                                      && dmEndpoint.length > 0;

						if (enabled && $scope.userTaskGroup && $scope.userTaskGroup.WorkOrderId) {
							$scope.convertMessage = "Add OP Codes";
						} else {
							$scope.convertMessage = "Create Work Order Estimate";
						}

						return enabled;
					}

					function getWorkOrderLookups() {
						if ($scope.userTask.gotOpCodes !== true) {
							getOpCodes();
						}
					};
					function toggleWorkOrderDropdowns(dropdown) {
					};
					function getOpCodes() {
						userTaskOpsCodesDataServiceDM.getOpCodes($scope.dmEndpoint).then(function (results) {
							for (var x in results) {
								results[x].Desc = results[x].Opcode + ' - ' + results[x].Desc;
							}
							$scope.userTask.ClientOpCodes = results;
							$scope.userTask.gotOpCodes = true;
							refreshMultiDropdown();
						});
					};

					var refreshMultiDropdown = function () {
						$timeout(function () {
							$('.selectpicker').selectpicker('refresh');
						});
					};
					function createServiceRequest() {
						if ($scope.isSampleTask) return;
						var opCodes = $scope.userTask.FirstOpCode;
						var OperationCodes = [],
                            updateWO = false;
						for (key in opCodes) {
							// "Good enough" for most cases
							if (String(parseInt(key, 10)) === key && opCodes.hasOwnProperty(key)) {
								if (opCodes[key].Opcode) {
									OperationCodes.push({ "Opcode": opCodes[key].Opcode })
								}
							}
						}

						var serviceRequestArgs;
						serviceRequestArgs = {
							"CustId": $scope.userTask.IntegrationKey,
							"OperationCodes": OperationCodes
						};
						if ($scope.userTaskGroup &&
                            $scope.userTaskGroup.WorkOrderId) {
							updateWO = true;
							serviceRequestArgs["WOId"] = $scope.userTaskGroup.WorkOrderId;
						}

						//Based on user Selection make a call to user Task Data Service
						if (OperationCodes.length > 0) {
							userTaskDataServiceDM.saveServiceRequest($scope.dmEndpoint, serviceRequestArgs).then(function (result) {
								var title = 'Work Order #' + result.WOId + ': ';
								title += $scope.userTaskGroup ? $scope.userTaskGroup.Title : $scope.userTask.Title;
								var opCodes = $scope.userTask.FirstOpCode;
								var tasks = [];
								for (key in opCodes) {
									// "Good enough" for most cases
									if (String(parseInt(key, 10)) === key && opCodes.hasOwnProperty(key)) {
										if (opCodes[key].Opcode) {
											tasks.push({
												UserRowId: $scope.userTask.UserRowId,
												AssignedUserRowId: userRowId,
												Title: opCodes[key].Desc,
												Opcode: opCodes[key].Opcode,
												Status: taskStatus.Posted,
												IsStatusChange: true,
												ParentTaskRowId: $scope.userTask.RowId || null
											})
										}
									}
								}


								var workOrderArgs = {
									ClientRowId: $scope.userTask.UserRowId,
									WorkOrder: {
										Title: title,
										UserRowId: userRowId,
										WorkOrderId: result.WOId,
										IntegrationKey: $scope.userTask.IntegrationKey,
									},
									Tasks: tasks,
									ParentTaskRowId: $scope.userTask.RowId,
									UserTaskGroupRowId: $scope.userTask.UserTaskGroupRowId,
									UpdateWO: updateWO
								};
								linkWorkOrder(workOrderArgs);
							});
						}
					};

					function linkWorkOrder(userWorkOrderArgs) {
						if ($scope.isSampleTask) return;
						var params = {
							isWorkOrder: false
						};
						dataService.add('UserTaskGroup', userWorkOrderArgs, params).then(function (result) {
							toastr.success('Work order has been created.');
							$scope.$parent.searchUserTasks();
							$rootScope.$broadcast('group.created', { list: result });
						});
					};


					$scope.convertTaskToTaskList = function (task, taskGroup) {
						if ($scope.isSampleTask) return;
						var dateString = new Date().toLocaleDateString().replace(/\//g, '-');
						var modalInstance = $modal.open({
							animation: true,
							templateUrl: 'convertToTaskListModal.html',
							controller: ['$scope', '$modalInstance', 'userTask', 'userTaskGroup', function ($scope, $modalInstance, userTask, userTaskGroup) {
								$scope.userTask = userTask;
								$scope.userTaskGroup = userTaskGroup;

								$scope.appendTaskToNewTaskList = function (newUserTaskTitle) {
									if (!$scope.userTask.NewTasks) {
										if (appStorage.get(dateString)) { // try to load from local storage
											$scope.userTask.NewTasks = appStorage.get(dateString);
										} else {
											$scope.userTask.NewTasks = [];
										}
									}
									$scope.userTask.NewTasks.push(newUserTaskTitle);
									appStorage.put(dateString, $scope.userTask.NewTasks);
									$scope.newUserTaskTitle = null;
								};

								$scope.continue = function () {
									if ($scope.newUserTaskTitle) {
										if (!$scope.userTask.NewTasks) $scope.userTask.NewTasks = [];
										$scope.userTask.NewTasks.push($scope.newUserTaskTitle);
									}
									$modalInstance.close($scope.userTask, $scope.userTaskGroup);
								};

								$scope.cancel = function () {
									$modalInstance.dismiss('cancel');
								};
							}],
							resolve: {
								userTask: function () {
									return task;
								},
								userTaskGroup: function () {
									return taskGroup;
								}
							}
						});

						modalInstance.result.then(function (task) {
							var userTaskGroup = new MyVillages.TaskerApp.UserTaskGroup(),
                                userTaskGroupRowId,
                                parentGroup = $scope.userTaskGroup || null;
							userTaskGroup.UserRowId = $scope.$parent.authInfo.userRowId;
							// assign to parent folder if our current group is a list inside a folder
							if (parentGroup && parentGroup.ParentGroupRowId) {
								userTaskGroup.ParentGroupRowId = parentGroup.ParentGroupRowId ? parentGroup.ParentGroupRowId : null;
							}
							else if (!parentGroup || (parentGroup.ParentGroupRowId == null && !parentGroup.IsFolder)) {
								// ungroupped
								userTaskGroup.ParentGroupRowId = null;
							}
							else {
								userTaskGroup.ParentGroupRowId = task.UserTaskGroupRowId ? task.UserTaskGroupRowId : null;
							}
							userTaskGroup.Title = task.Title;

							try {
								dataService.add('UserTaskGroup', userTaskGroup).then(function (result) {
									if (result.IsDuplicate) {
										toastr.error('Task list titled \'' + task.Title + '\' already exists');
									}
									else {
										toastr.success('Task list titled \'' + task.Title + '\' created.');
										userTaskGroupRowId = result.RowId;
										var userTaskGroupClient;
										var userTaskGroupClientRowId;
										var deferred = $q.defer();
										if ($scope.isClientTask) {
											// create group for client
											userTaskGroupClient = new MyVillages.TaskerApp.UserTaskGroup();
											userTaskGroupClient.UserRowId = task.UserRowId;
											userTaskGroupClient.Title = task.Title;
											dataService.add('UserTaskGroup', userTaskGroupClient).then(function (result) {
												if (result.IsDuplicate) {
													toastr.error('Task list titled \'' + task.Title + '\' already exists');
													deferred.reject('Task list titled \'' + task.Title + '\' already exists')
												}
												else {
													userTaskGroupClientRowId = result.RowId;
													// add a linked list
													var taskListXref = {
														ChildListRowId: userTaskGroupRowId,
														ParentListRowId: userTaskGroupClientRowId,
														LinkedListTypeId: linkedListType.ProviderList,
													};
													dataService.add('TaskListXref', taskListXref).then(function (result) {
														deferred.resolve('Task list titled \'' + task.Title + '\' created.');
													});
												}
											})
										} else {
											deferred.resolve('Not a client task');
										}
										if (task.RowId && userTaskGroupRowId) {
											// assign our task to the newly created task list
											var userTaskGroupXref = {
												UserTaskRowId: task.RowId,
												UserTaskGroupRowId: userTaskGroupRowId
											};
											$scope.$parent.toggleUserTaskGroupAssignment(userTaskGroupXref);
										}

										deferred.promise.then(function () {
											var promises = [];
											if (task.TaskTypeToken == 'ClientTask') {
												var userTaskGroupClientXref = {
													UserTaskRowId: task.RowId,
													UserTaskGroupRowId: userTaskGroupClientRowId
												};
												promises.push(dataService.add('UserTaskGroupXref', userTaskGroupClientXref));
											}
											angular.forEach(task.NewTasks, function (newTask) {
												if (!newTask) { return false; }
												var newUserTask = {};
												newUserTask.Title = newTask;
												newUserTask.UserRowId = task.TaskTypeToken == 'ClientTask' ? task.UserRowId : $scope.viewingUserRowId;
												newUserTask.Status = task.TaskTypeToken == 'ClientTask' ? taskStatus.Posted : taskStatus.NotAssigned;
												if (task.TaskTypeToken == 'ClientTask') {
													newUserTask.AssignedUserRowId = $scope.$parent.authInfo.userRowId;
												}
												newUserTask.IsStatusChange = true;
												promises.push(userTaskDataService.save(newUserTask).then(function (result) {
													var userTaskGroupXref = {
														UserTaskRowId: result.RowId,
														UserTaskGroupRowId: userTaskGroupRowId
													};
													promises.push(dataService.add('UserTaskGroupXref', userTaskGroupXref).then(function () {
														$scope.$parent.toggleUserTaskGroupAssignment(userTaskGroupXref);
													}));
													if (task.TaskTypeToken == 'ClientTask') {
														var userTaskGroupClientXref = {
															UserTaskRowId: result.RowId,
															UserTaskGroupRowId: userTaskGroupClientRowId
														};
														promises.push(dataService.add('UserTaskGroupXref', userTaskGroupClientXref));
													};
												}));
											});
											$q.all(promises).then(function () {
												// cleanup local storage
												appStorage.erase(dateString);
												toastr.success('All tasks have been added.');
												// reload all user tasks
												$scope.$parent.searchUserTasks();
												$rootScope.$broadcast('group.created', { list: result });
											})
										});
									}
									$scope.isLoaded = true;
								}, function (error) {
									toastr.error('Failed to create task list titled \'' + task.Title + '\'');
									$scope.isLoaded = true;
								});
							} catch (e) { if (console && console.log) console.log(e); }
						}, function () { });
					};

					function computeVisibleSettings() {
						$scope.isVisible = {
							taskActions: ($scope.isUserTask
									&& $scope.userTask.CurrentTaskStatus != taskStatus.Completed
									&& $scope.userTask.CurrentTaskStatus != taskStatus.Cancelled)
								|| ($scope.isClientTask
									&& $scope.userTask.CurrentTaskStatus != taskStatus.Completed
									&& $scope.userTask.CurrentTaskStatus != taskStatus.Cancelled)
								|| ($scope.isServiceTechTask
									&& $scope.userTask.CurrentTaskStatus != taskStatus.ServiceTechCompleted)
								|| ($scope.isSubcontractorTask
									&& $scope.userTask.CurrentTaskStatus != taskStatus.SubcontractorCompleted),
							notAssigned: $scope.userTask.CurrentTaskStatus == taskStatus.NotAssigned,
							taskPosted: $scope.userTask.CurrentTaskStatus == taskStatus.Posted
										|| $scope.userTask.CurrentTaskStatus == taskStatus.AwaitingClientApproval
										|| $scope.userTask.CurrentTaskStatus == taskStatus.PendingEstimate,
							taskPostedNoEstimate: $scope.userTask.CurrentTaskStatus == taskStatus.Posted,
							pendingEstimate: $scope.userTask.CurrentTaskStatus == taskStatus.PendingEstimate
								&& $scope.isClientTask,
							awaitingApproval: $scope.userTask.CurrentTaskStatus == taskStatus.AwaitingApproval
								&& !$scope.isClientTask,
							awaitingClientApproval: $scope.userTask.CurrentTaskStatus == taskStatus.AwaitingClientApproval
								&& $scope.isUserTask,
							approved: $scope.userTask.CurrentTaskStatus == taskStatus.Approved,
							estimateSubmitted: $scope.userTask.DateEstimateSubmitted != null,
							estimateApproved: $scope.userTask.DateEstimateApproved != null,
							estimateRejected: $scope.userTask.DateEstimateRejected != null,
							inProgress: $scope.userTask.DateInProgress != null,
							taskCompleted: $scope.userTask.DateCompleted != null,
							taskClosed: $scope.userTask.CurrentTaskStatus == taskStatus.EstimateRejected
										|| $scope.userTask.CurrentTaskStatus == taskStatus.Completed
										|| $scope.userTask.CurrentTaskStatus == taskStatus.Cancelled,
							isTaskGroupped: $scope.userTask.IsTaskGroupped,
							isBusinessSupervisor: $scope.isClientTask
								&& $scope.$parent.authInfo.userCategory == 'BusinessPremium'
								&& $scope.$parent.authInfo.isBusinessSupervisor,
							isBusinessServiceTech: $scope.isClientTask
								&& $scope.$parent.authInfo.userCategory == 'BusinessPremium'
								&& !$scope.$parent.authInfo.isBusinessSupervisor,
							isMessage: !($scope.userTask.TaskTypeToken == 'SharedTask'
										|| $scope.userTask.CurrentTaskStatus == taskStatus.EstimateRejected
										|| $scope.userTask.CurrentTaskStatus == taskStatus.Completed
										|| $scope.userTask.CurrentTaskStatus == taskStatus.Cancelled),
							isViewableByOwner: $scope.isClientTask
												&& !($scope.userTask.CurrentTaskStatus == taskStatus.EstimateRejected
												|| $scope.userTask.CurrentTaskStatus == taskStatus.Completed
												|| $scope.userTask.CurrentTaskStatus == taskStatus.Cancelled),
							isAssignServiceTech: ($scope.$parent.authInfo.isBusinessSupervisor
									&& $scope.isClientTask && $scope.isBusinessPremium)
								|| $scope.isSubcontractorTask,
							isAssignSubcontractor: $scope.$parent.authInfo.isBusinessSupervisor
												&& $scope.isClientTask
												&& $scope.userTask.CurrentTaskStatus != taskStatus.PendingEstimate
												&& $scope.userTask.CurrentTaskStatus != taskStatus.AwaitingApproval
												&& $scope.userTask.CurrentTaskStatus != taskStatus.AwaitingClientApproval
                                                && $scope.isBusinessPremium,
							isInProgressReason: $scope.userTask.CurrentTaskStatus == taskStatus.InProgress
												&& $scope.userTask.Reason != 0,
							isServiceTechReason: $scope.isClientTask
												&& $scope.$parent.authInfo.userCategory == 'BusinessPremium'
												&& $scope.userTask.CurrentTaskStatus == taskStatus.InProgress,
							startTaskServiceTech: $scope.isServiceTechTask
												&& $scope.userTask.CurrentTaskStatus == taskStatus.ServiceTechNotStarted,
							completeTaskServiceTech: $scope.isServiceTechTask
												&& $scope.userTask.CurrentTaskStatus == taskStatus.ServiceTechInProgress,
							startTaskSubcontractor: $scope.isSubcontractorTask
								&& $scope.userTask.CurrentTaskStatus == taskStatus.SubcontractorNotStarted,
							completeTaskSubcontractor: $scope.isSubcontractorTask
								&& $scope.userTask.CurrentTaskStatus == taskStatus.SubcontractorInProgress,
							clientBoatEquipment: $scope.isClientTask,
							isSubcontractorServiceTech: $scope.isServiceTechTask
								&& $scope.userTask.SubcontractorRowId != null
								&& $scope.userTask.SubcontractorRowId != undefined,
							isCheckAllTasksVisible: ($scope.isUserTask || $scope.isClientTask)
									&& $scope.userTask.CurrentTaskStatus != taskStatus.Completed
									&& $scope.userTask.CurrentTaskStatus != taskStatus.Cancelled,
						}
					};

					function getClientStuff(rowId) {
						var toySearchArgs = {
							OwnerId: $scope.userTask.UserRowId,
							OrderBy: 'DateCreated'
						};
						dataService.getAll('MyStuff', toySearchArgs, {}).then(function (result) {
							$scope.clientToys = result;
						});
					};

					function computeTaskTypeFlags() {
						$scope.isUserTask = $scope.userTask.TaskTypeToken == 'UserTask' && $scope.userTask.UserRowId === parseInt(window.userRowId) || $scope.userTask.TaskTypeToken == 'UserTask' && $scope.userTask.UserRowId === 0;
						$scope.isClientTask = $scope.userTask.TaskTypeToken == 'ClientTask';
						$scope.isSharedTask = $scope.userTask.TaskTypeToken == 'SharedTask';
						$scope.isServiceTechTask = $scope.userTask.TaskTypeToken == 'ServiceTechTask';
						$scope.isSubcontractorTask = $scope.userTask.TaskTypeToken == 'SubcontractorTask';
					};

					$scope.setStyle = function (group) {
						if (!group) group = {}
						if ($scope.$parent.authInfo.userCategory == 'BusinessPremium') {
							// use task status for styling of tasks (PRO only)
							return {
								'unlisted-task': !group.RowId || group.IsFolder,
								'panel-posted-task': $scope.userTask.CurrentTaskStatusDescription == 'Task Posted',
								'panel-awaiting-approval-task': $scope.userTask.CurrentTaskStatusDescription == 'Awaiting Estimate Approval' || ($scope.userTask.CurrentTaskStatusDescription == 'Service Tech In Progress' && $scope.userTask.ReasonDescription == 'Waiting for Parts'),
								'panel-pending-estimate-task': $scope.userTask.CurrentTaskStatusDescription == 'Pending Estimate',
								'panel-estimate-approved-task': $scope.userTask.CurrentTaskStatusDescription == 'Estimate Approved',
								'panel-estimate-approved-service-tech-task': ($scope.userTask.CurrentTaskStatusDescription == 'Estimate Approved' && $scope.userTask.ServiceTechDisplayName.split('|')[0] !== 'None'),
								'panel-in-progress-task': $scope.userTask.CurrentTaskStatusDescription == 'In Progress',
								'panel-in-progress-service-tech-task': $scope.userTask.CurrentTaskStatusDescription == 'Service Tech In Progress',
								'panel-subcontractor-task': $scope.isSubcontractorTask,
								'panel-completed-task': $scope.userTask.CurrentTaskStatusDescription == 'Completed',
								'panel-approved-task': $scope.userTask.CurrentTaskStatusDescription == 'Approved'
							};
						} else {
							// use task type for styling of tasks
							return {
								'unlisted-task': !group.RowId || group.IsFolder,
								'panel-client-task': $scope.isClientTask,
								'panel-shared-task': $scope.isSharedTask,
								'panel-service-tech-task': $scope.isServiceTechTask || $scope.userTask.AssignedUserRowId && $scope.userTask.AssignedUserRowId !== $scope.$parent.authInfo.userRowId
							};
						}
					};

					function assignSupervisor(assignedUserRowId) {
						// avoid assigning to the same supervisor
						if ($scope.viewingUserRowId == assignedUserRowId || $scope.isSampleTask) { return false; }
						if ($scope.isSubcontractorTask) {
							// reassign subcontractor supervisor
							var userTaskSubcontractorXref = {
								UserTaskRowId: $scope.userTask.RowId,
								ViewingUserRowId: $scope.viewingUserRowId,
								AssignedBy: $scope.userTask.AssignedUserRowId,
								SubcontractorRowId: assignedUserRowId,
							};
							userTaskDataService.reassignSubcontractorSupervisor(userTaskSubcontractorXref).then(function (result) {
								$timeout(function () {
									toastr.success("Subcontractor task has been reassigned");
									$scope.$parent.removeTaskFromList($scope.userTask, taskAction.DeleteTask);
								});
							});
						}
						else {
							// reassign supervisor
							var args = {
								UserTaskRowId: $scope.userTask.RowId,
								AssignedUserRowId: assignedUserRowId,
								ViewingUserRowId: $scope.viewingUserRowId,
							}
							userTaskDataService.assignSupervisor(args).then(function (result) {
								$timeout(function () {
									toastr.success("Task has been reassigned");
									$scope.$parent.removeTaskFromList($scope.userTask, taskAction.DeleteTask);
								});
							});
						}
					};

					function showStartTask() {
						return ($scope.isVisible.taskPostedNoEstimate || $scope.isVisible.estimateApproved || $scope.isVisible.approved) && $scope.isClientTask && !$scope.isVisible.inProgress
					};

					function isHideTaskAddTask(userTask) {
						if ($scope.$parent.otherSupervisors.isOtherSupervisorsQueue || $scope.isListOrTaskById || userTask.Opcode) {
							return true;
						}
						return false;
					};

					function clearTaskRating() {
						if ($scope.isSampleTask) return;
						$scope.rate = 0;
						$scope.userTask.Rating = 0;
						userTaskDataService.persistTaskRating($scope.userTask.RowId, 0);
					};

					computeTaskTypeFlags();
					computeVisibleSettings();

					angular.extend($scope, {
						viewingUserRowId: null,
						isRender: false,
						isCollapsed: true,
						deleteUserTask: deleteUserTask,
						toggleWorkOrderDropdowns: toggleWorkOrderDropdowns,
						createServiceRequest: createServiceRequest,
						postUserTask: postUserTask,
						submitEstimate: submitEstimate,
						approveEstimate: approveEstimate,
						rejectEstimate: rejectEstimate,
						updateUserTask: updateUserTask,
						updateUserTaskStatus: updateUserTaskStatus,
						updateUserTaskTitle: updateUserTaskTitle,
						toggleTaskDetails: toggleTaskDetails,
						saveFeedbackComment: saveFeedbackComment,
						saveNotes: saveNotes,
						assignSharedUser: assignSharedUser,
						unassignSharedUser: unassignSharedUser,
						assignServiceTech: assignServiceTech,
						feedbackComment: '',
						subcontractors: [],
						userToys: [],
						clientToys: [],
						toyEquipment: [],
						assignedUser: null,
						assignedServiceTech: '',
						serviceTechs: [],
						taskPost: {
							UserTaskRowId: $scope.userTask.RowId,
							AssignedUserRowId: null,
							AssignedUserEmail: '',
							TypeaheadDisplay: '',
							ToyRowId: $scope.userTask.ToyRowId,
							ActiveToyEquipmentIdsList: [],
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
						},
						opened: {},
						completeTask: {
							UserTaskRowId: $scope.userTask.RowId,
							AssignedUserRowId: null,
							AssignedUserEmail: '',
							TypeaheadDisplay: '',
							ToyRowId: null,
							ActiveToyEquipmentIdsList: [],
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
							CompleteDate: null
						},
						suggestContact: suggestContact,
						suggestServiceTech: suggestServiceTech,
						suggestServiceTechDm: suggestServiceTechDm,
						suggestSubcontractor: suggestSubcontractor,
						typeaheadDisplayUser: typeaheadDisplayUser,
						typeaheadDisplayServiceTech: typeaheadDisplayServiceTech,
						typeaheadDisplaySubcontractor: typeaheadDisplaySubcontractor,
						checkUser: checkUser,
						assignCompleteUser: assignCompleteUser,
						assignSubcontractor: assignSubcontractor,
						removeServiceTech: removeServiceTech,
						removeSubcontractor: removeSubcontractor,
						viewSubcontractorNotes: viewSubcontractorNotes,
						saveSubcontractorNote: saveSubcontractorNote,
						saveInProgressReason: saveInProgressReason,
						saveUserTaskTag: saveUserTaskTag,
						deleteUserTaskTag: deleteUserTaskTag,
						saveUserTaskNotes: saveUserTaskNotes,
						getClientStuff: getClientStuff,
						openDatepicker: openDatepicker,
						renderHtml: renderHtml,
						noToySelectedPromptBugMe: false,
						toggleSelected: toggleSelected,
						toggleReminder: toggleReminder,
						toggleQuickNotes: toggleQuickNotes,
						getUserTaskMessages: getUserTaskMessages,
						dpOptions: dpOptions,
						supervisors: [],
						assignSupervisor: assignSupervisor,
						showStartTask: showStartTask,
						isHideTaskAddTask: isHideTaskAddTask,
						clearTaskRating: clearTaskRating,
						completeUserTask: completeUserTask,
						getSampleToyEquipment: getSampleToyEquipment,
					});
					var userTaskServiceTech = _.find($scope.userTask.UserTaskServiceTechXrefs, function (userTaskServiceTechXref) { return userTaskServiceTechXref.IsActive != null ? userTaskServiceTechXref.IsActive : true });
					if (userTaskServiceTech) {
						$scope.taskPost.ServiceTechRowId = userTaskServiceTech.ServiceTechRowId;
					};
					if ($scope.$parent.listOrTaskById.isTaskById) {
						toggleTaskDetails();
					}
				}],
    		link: function (scope, element, attrs, ctrl) {
    			scope.viewingUserRowId = scope.$parent.otherSupervisors.isOtherSupervisorsQueue ? scope.$parent.otherSupervisors.selectedSupervisorId : scope.$parent.authInfo.userRowId;
    			scope.subcontractors = scope.$parent.subcontractors;
    			scope.userToys = scope.$parent.userToys;
    			scope.createdByUsers = scope.$parent.createdByUsers;
    			scope.serviceTechs = scope.$parent.serviceTechs;
    			scope.isCollapsed = !scope.$parent.listOrTaskById.isTaskById;
    			scope.supervisors = scope.$parent.supervisors;
    			if (scope.userTask.Opcode) {
    				element.addClass('sub-tasks');
    			}

    			window.sampleTasksHidden = 0
    			var sampleTasks
    			scope.$on('event:deleteSampleTask', function (event, args) {
    				if (args.userTask) {
    					element.slideUp()
    					window.sampleTasksHidden++
    					sampleTasks = jQuery('.sample-tasks-list').find('.panel')
    					if (window.sampleTasksHidden === sampleTasks.length) {
    						jQuery('.sample-tasks-list').slideUp('fast');
    					}
    				}
    			});
    		}
    	};
    }]);