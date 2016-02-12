angular.module('myVillages.tasker.app.common.directives').
    directive('tkCreateTask', ['dataService', 'userTaskDataService', 'taskQueue', 'taskStatus', 'userTaskEquipment', 'userTaskDataServiceDM', 'userTaskOpsCodesDataServiceDM', function (dataService, userTaskDataService, taskQueue, taskStatus, userTaskEquipment, userTaskDataServiceDM, userTaskOpsCodesDataServiceDM) {
        return {
            templateUrl: "/Scripts/tasker/app/userTask/createTask.html",
            restrict: "E",
            scope: {
    			notifyParent: "&method"
            },
            controller: ['$scope', '$rootScope', '$timeout', function ($scope, $rootScope, $timeout) {
                var createUserTaskTimeout;
                $scope.isBusinessServiceTech = $scope.$parent.authInfo.userCategory == 'BusinessPremium' && !$scope.$parent.authInfo.isBusinessSupervisor;
                $scope.dmEndpoint = $scope.$parent.authInfo.dmEndpoint;
                $scope.isWorkOrderIntegrationEnabled = $scope.$parent.authInfo.isWorkOrderIntegrationEnabled;
                
    			var setUserTitle = function () {
                    var title = $scope.newUserTask != null ? $scope.newUserTask.Title : "";
                    $scope.newUserTask.Title = title;
                };

    			var refreshMultiDropdown = function () {
    				$timeout(function () {
                        $('.selectpicker').selectpicker('refresh');
                    });
                }

                function createUserTask() {
                    clearTimeout(createUserTaskTimeout);
                    createUserTaskTimeout = setTimeout(function () {
                        setUserTitle();
                        if ($scope.newUserTask.Title == '') { return false; }
                        $scope.newUserTask.UserRowId = $scope.$parent.authInfo.userRowId;
                        $scope.newUserTask.Status = taskStatus.NotAssigned;
                        $scope.newUserTask.IsStatusChange = true;
                        
                        // create a simple payload for new task creation
                        var payload = {
    						Title: $scope.newUserTask.Title,
    						UserRowId: $scope.$parent.authInfo.userRowId,
                            Status: taskStatus.NotAssigned,
    						IsStatusChange: true
                        };
                        userTaskDataService.save(payload).then(function (result) {
                            $scope.newUserTask = MyVillages.TaskerApp.UserTask();
                            $scope.isCreateOnBehalf = false;
                            toastr.success('User Task has been added');
                            $scope.notifyParent({ newUserTask: result })
                        });
                    }, 600);
                };

                function suggestAuthorizedClient(searchKeyword) {
                    return userTaskDataService.getAuthorizedClients(searchKeyword).then(function (results) {
                        return results;
                    });
                };

                function assignClient(data) {
                    resetNewUserTask(true);
                    if (typeof data === 'object') {
                        $scope.newUserTask.UserRowId = data.RowId;
    					$scope.newUserTask.ContactRowId = data.ContactRowId;
                        $scope.newUserTask.IntegrationKey = data.IntegrationKey;
                        $scope.newUserTask.ActiveToyEquipmentIdsList = [];
    					$scope.getClientStuff($scope.newUserTask.UserRowId, $scope.newUserTask.ContactRowId);
					}
                    else {
                        $scope.newUserTask.UserRowId = null;
    					$scope.newUserTask.ContactRowId = null;
                        $scope.newUserTask.IntegrationKey = null;
                        toastr.error('Please select Client from the list');
                    }
                };

                function isWorkOrderEnabled() {
                    return $scope.newUserTask.IntegrationKey !== null && $scope.newUserTask.IntegrationKey !== '' && isWorkOrderIntegrationEnabled === 'True' && !_.isUndefined(dmEndpoint) && dmEndpoint.length > 0;
                }

    			function getClientStuff(ownerId, contactId) {
    				var searchArgs = {
    					OwnerId: ownerId,
    					ContactRowId: contactId,
                    };
    				userTaskDataService.getUserToys(searchArgs).then(function (result) {
                    	$scope.clientToys = result;
                    	$scope.$broadcast('clientStuff');
                    });
                };

                function dpOptions() {
                    var options = {
                        showWeeks: false
                    }
                    return options;
                }

                function openDatepicker($event, elementOpened) {
                    $event.preventDefault();
                    $event.stopPropagation();
                    $scope.opened[elementOpened] = !$scope.opened[elementOpened];
                };

                function cancelCreateOnBehalf() {
                    resetNewUserTask();
                    $scope.isCreateOnBehalf = false;
                    $scope.selectedClient = undefined;
                    $scope.clientToys = [];
                    $scope.toyEquipment = [];
                }

                function resetNewUserTask(useCurrentTitle) {
                    var title = $scope.newUserTask != null ? $scope.newUserTask.Title : "";
                    $scope.newUserTask = MyVillages.TaskerApp.UserTask();
    				if (useCurrentTitle) {
                        $scope.newUserTask.Title = title;
                    }
                };

                function prePostClientTask() {
                    if ($scope.newUserTask.Title == '') { return false; }
    				if ($scope.newUserTask && $scope.newUserTask.IsWorkOrder === true) {
                        postClientWorkOrder();
                    } else {
                        postClientTask();
                    }
                };

                function postClientTask() {
                    $scope.newUserTask.AssignedUserRowId = parseInt(userRowId);
                    $scope.newUserTask.Status = $scope.newUserTask.IsRequestEstimateChecked ? taskStatus.AwaitingApproval : $scope.newUserTask.IsRequestApproval ? taskStatus.AwaitingClientApproval : taskStatus.Posted;
                    $scope.newUserTask.IsStatusChange = true;
                    $scope.newUserTask.SelectedToyEquipmentIdsList = $scope.newUserTask.ActiveToyEquipmentIdsList;
                    $scope.newUserTask.EquipmentPersistType = userTaskEquipment.EquipmentPosted;
                    var payload = {};
                    angular.copy($scope.newUserTask, payload)
                    delete payload['RowId']
                    delete payload['UserEmail']
                    delete payload['Labor']
                    delete payload['Note']
                    delete payload['Notes']
                    delete payload['Feedbacks']
                    userTaskDataService.save(payload).then(function (result) {
                        $scope.newUserTask = MyVillages.TaskerApp.UserTask();
                        $scope.isCreateOnBehalf = false;
                        cancelCreateOnBehalf();
                        toastr.success('Client Task has been posted');
                        $scope.notifyParent({ newUserTask: result })
                    });
                }

                function linkWorkOrder(userWorkOrderArgs) {
                    var params = {
                        isWorkOrder: true
                    };
                    dataService.add('UserTaskGroup', userWorkOrderArgs, params).then(function (result) {
                        toastr.success('Work order has been created.');
                        $scope.newUserTask = null;
                        $scope.$parent.searchUserTasks();
                        cancelCreateOnBehalf();
						$rootScope.$broadcast('group.created', { list: result });
                    });
                };

                function postClientWorkOrder() {
                    if ($scope.newUserTask.selectedWorkOrderToLink && !_.isUndefined($scope.newUserTask.selectedWorkOrderToLink.Id) && $scope.newUserTask.selectedWorkOrderToLink.Id !== null) {
                        userTaskDataServiceDM.getWorkOrderDetails($scope.dmEndpoint, $scope.newUserTask.selectedWorkOrderToLink.Id).then(function (results) {
                            var title = 'Work Order #' + results.Id + ': ' + $scope.newUserTask.Title;
                            var userTasks = [];
    						results.Operations.forEach(function (task) {
                                userTasks.push({
                                    UserRowId: $scope.newUserTask.UserRowId,
                                    AssignedUserRowId: userRowId,
    								ToyRowId: $scope.newUserTask.ToyRowId,
    								SelectedToyEquipmentIdsList: $scope.newUserTask.ActiveToyEquipmentIdsList,
                                    Opcode: task.Opcode,
                                    Title: 'WO #' + results.Id + ', Op Code #' + task.Opcode + ' - ' + task.Desc,
                                    Status: $scope.newUserTask.IsRequestEstimateChecked || (task.EstimatedCharges && task.EstimatedCharges > 0 && task.Approved && task.Approved !== true) ? taskStatus.AwaitingApproval : $scope.newUserTask.IsRequestApproval ? taskStatus.AwaitingClientApproval : taskStatus.Posted,
                                    IsStatusChange: true,
                                    EstimateAmount: task.EstimatedCharges
                                });
                            });
                            var workOrderArgs = {
                                ClientRowId: $scope.newUserTask.UserRowId,
                                WorkOrder: {
                                    Title: title,
                                    UserRowId: userRowId,
                                    WorkOrderId: results.Id,
                                    IsWorkOrderApproved: true,
                                    IntegrationKey: $scope.newUserTask.IntegrationKey
                                },
                                Tasks: userTasks
                            };
                            linkWorkOrder(workOrderArgs);
                        });
                    } else {
                        createServiceRequest();
                    }
                };

                function createServiceRequest() {
    				var selectedToy = group = _.where($scope.clientToys, { RowId: $scope.newUserTask.ToyRowId })[0];
    				var boatIntegrationKey = (selectedToy) ? selectedToy.IntegrationKey : null;
                    var _normalizeServiceRequestArgs = function () {
    					var opcodes = _.map($scope.newUserTask.FirstOpCode, function (obj, key) { return { Opcode: obj.Opcode } });
                        return {
    						CustId: $scope.newUserTask.IntegrationKey,
    						OperationCodes: opcodes,
    						BoatId: boatIntegrationKey,
                    }
                    },
                    _normalizeWorkOrderArgs = function (result) {
                        var title = 'Work Order #' + result.WOId + ': ' + $scope.newUserTask.Title;
                        var tasks = _.map($scope.newUserTask.FirstOpCode, function (obj, key) {
                            return {
                                UserRowId: $scope.newUserTask.UserRowId,
                                AssignedUserRowId: userRowId,
                    			ToyRowId: $scope.newUserTask.ToyRowId,
                    			SelectedToyEquipmentIdsList: $scope.newUserTask.ActiveToyEquipmentIdsList,
                                Title: 'WO #' + result.WOId + ', Op Code #' + obj.Desc,
                                Opcode: obj.Opcode,
                                Status: $scope.newUserTask.IsRequestEstimateChecked ? taskStatus.AwaitingApproval : $scope.newUserTask.IsRequestApproval ? taskStatus.AwaitingClientApproval : taskStatus.Posted,
                                IsStatusChange: true
                            }
                        });
                        return {
                            ClientRowId: $scope.newUserTask.UserRowId,
                            WorkOrder: {
                                Title: title,
                                UserRowId: userRowId,
                                WorkOrderId: result.WOId,
                                IntegrationKey: $scope.newUserTask.IntegrationKey
                            },
                            Tasks: tasks
                        }
                    },
                    serviceRequestArgs = _normalizeServiceRequestArgs();

                    userTaskDataServiceDM.saveServiceRequest($scope.dmEndpoint, serviceRequestArgs).then(function (result) {
                        var workOrderArgs = _normalizeWorkOrderArgs(result);
                        linkWorkOrder(workOrderArgs);
                    });
                };

                function isCreateTaskButtonDisabled() {
                    var isDisabled = true;
    				if ($scope.newUserTask.IsWorkOrder === true) {
                        isDisabled = !($scope.newUserTask.UserRowId && $scope.newUserTask.Title && ($scope.newUserTask.selectedWorkOrderToLink || $scope.newUserTask.FirstOpCode))
                    } else {
                        isDisabled = !($scope.newUserTask.UserRowId && $scope.newUserTask.Title);
                    }
                    return isDisabled;
                };

                angular.extend($scope, {
                    isCreateOnBehalf: false,
                    newUserTask: MyVillages.TaskerApp.UserTask(),
                    createUserTask: createUserTask,
                    getClientStuff: getClientStuff,
                    suggestAuthorizedClient: suggestAuthorizedClient,
                    assignClient: assignClient,
                    dpOptions: dpOptions,
                    openDatepicker: openDatepicker,
                    cancelCreateOnBehalf: cancelCreateOnBehalf,
                    postClientTask: postClientTask,
                    prePostClientTask: prePostClientTask,
                    isWorkOrderEnabled: isWorkOrderEnabled,
                    isCreateTaskButtonDisabled: isCreateTaskButtonDisabled,
                    opened: {}
                });
            }]
        };
    }]);