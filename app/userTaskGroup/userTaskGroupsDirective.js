angular.module('myVillages.tasker.app.userTask')
    .directive('tkUserTaskGroups', ['$timeout', function ($timeout) {
    	return {
    		restrict: 'E',
    		scope: {
    			userTasks: '='
    		},
    		templateUrl: '/Scripts/tasker/app/userTaskGroup/userTaskGroups.html',
    		controller: ['$scope', 'authService', 'dataService', '$rootScope', '$timeout', 'userTaskDataService',
				function ($scope, authService, dataService, $rootScope, $timeout, userTaskDataService) {
					var userRowId = authService.getAuthInfo().userRowId;

					function initialize() {
						if ($scope.$parent.$parent) $scope.$managerScope = $scope.$parent.$parent;
						else $scope.$managerScope = false;
					};

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

					$scope.$parent.$watch('myFoldersList', function (myFoldersList) {
						if (myFoldersList) {
							$scope.myFoldersList = _.where(myFoldersList, { IsFolder: true });
							angular.forEach($scope.myFoldersList, function (folder) {
								folder.isCollapsed = true;
								folder.IsActive = false;
							});
						}
					});

					$scope.$parent.$watch('isFiltersLoaded', function (isFiltersLoaded) {
						if (isFiltersLoaded) {
							$timeout(function () {
								$scope.isLoaded = true;
							}, 1000);
						}
					});

					$rootScope.$on('event:taskGroupNameChange', function (event, args) {
					    if (args.userTaskGroup) {
					        var userTaskGroup = _.where($scope.myFoldersList, { RowId: args.userTaskGroup.RowId });
					        if (userTaskGroup.length > 0) {
					            $timeout(function () {
					                userTaskGroup[0].Title = args.userTaskGroup.Title;
					            });
					        }
					    }
					});

					function setSelectedList(list, context) {
					    if(list.RowId === $scope.$parent.taskLists.selectedTasksList.RowId) return
						angular.forEach($scope.myFoldersList, function (folder) {
							folder.IsActive = folder.RowId == list.RowId;
							angular.forEach(folder.GroupSubGroups, function (child) {
								child.IsActive = child.RowId == list.RowId;
							});
						});
						$rootScope.$broadcast('setSelectedList', { list: list, context: context || false });
						return;
					};

					function deleteUserTaskGroup(list) {
						var context = list.IsFolder ? "Folder" : "Task List";
						bootbox.confirm("Are you sure you want to delete this " + context + "?", function (result) {
							if (result) {
								$scope.isLoaded = false;
								if (!list.UserRowId) list.UserRowId = userRowId;
								dataService.remove('UserTaskGroup', list.RowId).then(function (result) {
								    if ($scope.myFoldersList) {
								        var index = _.indexOf($scope.myFoldersList, list);
								        $timeout(function () {
								            if (index !== -1) {
								                $scope.myFoldersList.splice(index, 1);
								                $rootScope.$broadcast('group.deleted', { group: list });
								            }
								        });
								    } else {
                                        // worst case, we just reload the page
								        window.location.reload();
								    }

								    if (list.Title == $scope.$parent.taskLists.selectedTasksList.Title) {
								        window.location = '/Tasker#/tasks';
								        window.location.reload();
								        //$scope.setSelectedList($scope.$parent.$parent.$parent.$parent.$parent.$parent.individualTasksList)
									}
									$scope.isLoaded = true;
									toastr.success(context + ' titled \'' + list.Title + '\' has been deleted.');									
								}, function (error) {
									toastr.error('Failed to delete ' + context + ' titled \'' + list.Title + '\'');
									$scope.isLoaded = true;
								});
							}
						});
					};

					function addTaskFolder(folder) {
						$scope.isLoaded = false;
						if (!folder.UserRowId) folder.UserRowId = userRowId;
						folder.IsFolder = true;
						dataService.add('UserTaskGroup', folder).then(function (result) {
							if (result.IsDuplicate) {
								toastr.error('Task folder titled \'' + folder.Title + '\' already exists');
							}
							else {
								result.IsFolder = true;
								toastr.success('Task folder titled \'' + folder.Title + '\' created.');
								$scope.$broadcast('UserTaskGroupCreated', { list: result });
							}
							$scope.isLoaded = true;
						}, function (error) {
							toastr.error('Failed to create task folder titled \'' + folder.Title + '\'');
							$scope.isLoaded = true;
						});
					};

					function addTaskList(list) {
						$scope.isLoaded = false;
						if (!list.UserRowId) list.UserRowId = userRowId;
						list.IsFolder = false;
						dataService.add('UserTaskGroup', list).then(function (result) {
							if (result.IsDuplicate) {
								toastr.error('Task list titled \'' + list.Title + '\' already exists');
							}
							else {
								toastr.success('Task list titled \'' + list.Title + '\' created.');
								$scope.$broadcast('UserTaskGroupCreated', { list: result });
							}
							$scope.isLoaded = true;
						}, function (error) {
							toastr.error('Failed to create task list titled \'' + list.Title + '\'');
							$scope.isLoaded = true;
						});
					};

					function updateTaskList(list) {
					    $scope.isLoaded = false;
						if (!list.UserRowId) list.UserRowId = userRowId;
						dataService.update('UserTaskGroup', list.RowId, list).then(function (result) {
							toastr.success('Task list titled \'' + list.Title + '\' updated.');
							$scope.$broadcast('UserTaskGroupUpdated', { list: result });
							$scope.isLoaded = true;
						}, function (error) {
							toastr.error('Failed to create task list titled \'' + list.Title + '\'');
							$scope.isLoaded = true;
						});
					};

					function onUserTaskDropComplete(userTask, userTaskGroup) {
					    if (userTask.userTask) userTask = userTask.userTask; // hacky but it works
					    var source = userTask.userTask ? userTask.userTask : userTask; // tertiary statement to pick up both lists and tasks
					    if (!userTask.TaskTypeToken && userTaskGroup.ParentGroupRowId) {
							toastr.success('Lists can only be added to folders.');
							return;
						}
						// check if dragged object is list and already has different parent folder
						if (!userTask.TaskTypeToken &&
							 userTaskGroup.ParentGroupRowId &&
							 userTask.ParentGroupRowId !== userTaskGroup.RowId) { return; }
						else {
							// check if list is being dragged onto folder
						    if (!userTask.TaskTypeToken && !userTaskGroup.ParentGroupRowId) {
						        // adjust counts in previous folder
						        var list, lists;
						        if (!source.ParentGroupRowId) {
						            $timeout(function () {
						                var idx = _.findIndex($scope.$parent.inboxGroupsList, { RowId: source.RowId })                                        
						                if (idx !== -1) {
                                            // remove from inbox groups list array
						                    $scope.$parent.inboxGroupsList.splice(idx, 1)
						                }
						                $scope.$parent.individualTasksList.TaskCount = ($scope.$parent.individualTasksList.TaskCount - source.TaskCount);
						                $rootScope.$broadcast('counts.updated', { count: $scope.$parent.individualTasksList.TaskCount, RowId: null });
						            });
						        } else {
						            lists = fn($scope.$parent.userTasksGroupsList, source.ParentGroupRowId);
                                    if (lists && lists.length > 0) {
						                list = lists[0];
						                $timeout(function () {
						                    var idx = _.findIndex(list.GroupSubGroups, { RowId: source.RowId })
						                    if (idx !== -1) {
						                        // remove from inbox groups list array
						                        list.GroupSubGroups.splice(idx, 1)
						                    }
						                    list.TaskCount = (list.TaskCount - source.TaskCount)
						                    $rootScope.$broadcast('counts.updated', { count: list.TaskCount, RowId: list.RowId });
						                });
						                
						                if (!list.ParentGroupRowId) {
						                    $timeout(function () {
						                        var idx = _.findIndex($scope.$parent.inboxGroupsList, { RowId: source.RowId })
						                        if (idx !== -1) {
						                            // remove from inbox groups list array
						                            $scope.$parent.inboxGroupsList.splice(idx, 1)
						                        }
						                        $scope.$parent.individualTasksList.TaskCount = ($scope.$parent.individualTasksList.TaskCount - source.TaskCount); // list inside the inbox
						                        $rootScope.$broadcast('counts.updated', { count: $scope.$parent.individualTasksList.TaskCount, RowId: null });
						                    })
						                }
						            }
						        }
								userTask.ParentGroupRowId = userTaskGroup.RowId;
								dataService.update('UserTaskGroup', userTask.RowId, userTask).then(function (result) {
								    toastr.success('List has been added as child');

								    // update my folders
									$scope.$parent.getMyFoldersList().then(function () {
										// make new list selected and show it
										$scope.$parent.toggleUserTaskGroup(userTaskGroup, 'ignore'); // ignore toggle
									});
								}, function (error) {
									toastr.error(error.Message);
								});
							} else {
								// task being dragged into list/folder
							    var userTaskGroupXref = {
									UserTaskRowId: userTask.RowId,
									UserTaskGroupRowId: userTaskGroup.RowId
							    };
							    $timeout(function () {
                                    // was task in inbox?
							        if (userTask.UserTaskGroupRowId === 0) {
                                        // find the task in inbox tasks array
							            var idx = _.findIndex($scope.$parent.individualTasksList.GroupTasks, { RowId: userTask.RowId })
							            if (idx !== -1) {
							                // remove from inbox tasks array
							                $scope.$parent.individualTasksList.GroupTasks.splice(idx, 1)
							            }
							        } else {
							            // search deeper
							            lists = fn($scope.$parent.userTasksGroupsList, source.UserTaskGroupRowId);
							            if (lists && lists.length > 0) {
							                list = lists[0]
							                var idx = _.findIndex(list.GroupTasks, { RowId: userTask.RowId })
							                if (idx !== -1) {
							                    // remove from list tasks array
							                    list.GroupTasks.splice(idx, 1)
							                    list.TaskCount--

							                    if (!list.ParentGroupRowId && !list.IsFolder) {
							                        $scope.$parent.individualTasksList.TaskCount--
							                    } else {
							                        parentList = _.findWhere($scope.$parent.userTasksGroupsList, { RowId: list.ParentGroupRowId })
							                        if (parentList) parentList.TaskCount--
							                    }
							                }
							            }
							            
							        }
							    })
								$scope.$parent.toggleUserTaskGroupAssignment(userTaskGroupXref);
							}
						}
					};

					function onUserTaskChildDropComplete(userTask, userTaskGroup) {
						if (!userTask.TaskTypeToken) {
							// cannot add more than one level deep of lists
							toastr.error('Oops! Cannot add a list to a child list.');
							return;
						} else {
							var userTaskGroupXref = {
								UserTaskRowId: userTask.RowId,
								UserTaskGroupRowId: userTaskGroup.RowId
							};
							$scope.$parent.toggleUserTaskGroupAssignment(userTaskGroupXref);
						}
					};

					initialize();

					angular.extend($scope, {
						userTaskListsList: [],
						myFoldersList: [],
						selectedList: {},
						setSelectedList: setSelectedList,
						deleteUserTaskGroup: deleteUserTaskGroup,
						addTaskFolder: addTaskFolder,
						addTaskList: addTaskList,
						updateTaskList: updateTaskList,
						onUserTaskDropComplete: onUserTaskDropComplete,
						onUserTaskChildDropComplete: onUserTaskChildDropComplete,
						isLoaded: false
					});
				}],
    		link: function (scope, elem, attrs) {
    			scope.$parent.taskListAction = 'Create folder';
    			scope.context = 'folders';
    			scope.$on('UserTaskGroupCreated', function (event, args) {
    			    if (args.list) {
    					if (args.list.IsFolder) {
    						scope.$parent.userTasksGroupsList.unshift(args.list);
    						scope.myFoldersList.unshift(args.list);
    						scope.newUserTaskFolder.Title = null;
    					    // set selected list
    					    //Creating a Folder should not navigates user to that empty Folder, 
    					    //it should leave the user where they were with no refresh
                            //commenting for defect 6037
    						//scope.setSelectedList(scope.myFoldersList[0]);
    					} else {
    						scope.userTaskListsList.unshift(args.list);
    						scope.newUserTaskList.Title = null;
    						// set selected list
    						scope.setSelectedList(scope.userTaskListsList[0]);
    					}
    					// focus new task field
    					scope.$parent.taskListAction = 'Create task';
    					$timeout(function () {
    						angular.element($('.newUserTask input[ng-model="$managerScope.newUserTask.Title"]')).focus();
    					});
    				}
    			});
    			scope.$on('UserTaskGroupUpdated', function (event, args) {
    			    if (args.list) {
    			        if (args.list.RowId === scope.$parent.taskLists.selectedTasksList.RowId) {
    			            // update the selected task list / folders title on the right
    			            $timeout(function () {
    			                scope.$parent.taskLists.selectedTasksList.Title = args.list.Title;
    			            })
    			            // return because we don't need to reselect the already selected task list
    			            // causes an unwanted page refresh
    			            return
    			        } else {
    			            // set selected list
    			            scope.setSelectedList(args.list);
    			        }
    				}
    			});
    		}
    	};
    }]);