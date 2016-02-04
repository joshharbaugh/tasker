angular.module('myVillages.tasker.app.userTask')
    .directive('tkUserTaskHours', [function () {
    	return {
    		restrict: 'E',
    		scope: {
    			userTask: '=',
    			userTaskHours: '=',
                parentTaskGroup: '='
    		},
    		templateUrl: '/Scripts/tasker/app/userTaskHour/userTaskHour.html',
    		controller: ['$scope', 'authService', 'dataService', 'linkedMediaDataService', '$upload', '$q', '$timeout', 'API_BASE_URL', 'azureServiceBusQueueService', 'userTaskHourDataServiceDM', '$modal',
                function ($scope, authService, dataService, linkedMediaDataService, $upload, $q, $timeout, API_BASE_URL, azureServiceBusQueueService, userTaskHourDataServiceDM, $modal) {
                	'use strict';
                	var userRowId = authService.getAuthInfo().userRowId;
                	var isAzureServiceBusIntegrationEnabled = authService.getAuthInfo().isAzureServiceBusIntegrationEnabled;

                    var convertStartEndTimesToAmPm = function (taskHour) {
                        if(taskHour.StartTime){
                           taskHour.StartTime = moment(taskHour.StartTime, ["HH:mm"]).format("h:mm a");
                        }
                        if(taskHour.EndTime){
                            taskHour.EndTime = moment(taskHour.EndTime, ["HH:mm"]).format("h:mm a");
                        }
                        return taskHour;
                    };

                    var convertStartEndTimesToAmPmInput = function (taskHour) {
                        if(taskHour.StartTime){
                           taskHour.StartTime = new Date("1/1/2000 " + moment(taskHour.StartTime, ["HH:mm"]).format("h:mm a"));
                        }
                        if(taskHour.EndTime){
                            taskHour.EndTime = new Date("1/1/2000 " + moment(taskHour.EndTime, ["HH:mm"]).format("h:mm a"));
                        }
                        return taskHour;
                    };

                	function initialize() {
                	    userTaskHourSearch($scope.userTask.RowId);                	    
                	};

                	function reset() {
                		$scope.userTaskHour = {
							RowId: 0,
                			UserTaskParts: [],
                			ItemNumber: '',
                			Receipts: [],
                		};
                		$scope.uploadFiles = [];
                		$scope.deleteFiles = [];
                		$scope.deleteParts = [];
                		initialize();
                	}

                	function userTaskHourRead(userTaskHourId) {
                		dataService.get('UserTaskHour', userTaskHourId, {}).then(function (result) {
                			$scope.userTaskHour = convertStartEndTimesToAmPmInput(result);
                		});
                	};

                	function userTaskHourSearch(userTaskRowId) {
                		var searchArgs = {
                			UserTaskRowId: userTaskRowId,
                			SubcontractorRowId: $scope.userTask.SubcontractorRowId,
                		};
                		dataService.getAll('UserTaskHour', searchArgs, {}).then(function (result) {
                			if ($scope.isBusinessSupervisor) {
                				$scope.userTaskHours = result;
                			}
                			else {
                				$scope.userTaskHours = _.where(result, { ServiceTechRowId: parseInt($scope.$parent.viewingUserRowId) });
                			}
                            $scope.userTaskHours.forEach(function (taskHour) {
                                convertStartEndTimesToAmPm(taskHour);
                            });
                            $scope.isLoading = false;

                            // manually init the tooltips plugin
                            $timeout(function () {
                                $('[data-toggle="tooltip"]').tooltip()
                            })
                		});
                	};

                	var persistHoursToMTI = function (payload, taskHour) {
                	    dataService.add('UserTaskHour', payload).then(function (result) {
                	        taskHour.RowId = result.RowId;
                	        taskHour.RowGuid = result.RowGuid;
                	        var deletePartsPromise = deleteParts();
                	        var savePartsPromise = saveParts(taskHour);
                	        var deleteMediaPromise = deleteLinkedMedia();
                	        var addMediaPromise = addLinkedMedia(taskHour);
                	        $q.all([deletePartsPromise, savePartsPromise, deleteMediaPromise, addMediaPromise]).then(function (result) {
                	            toastr.success('Log Hours saved successfully');
                	            reset();
                	        });
                	    }, function (error) {
                	        toastr.error(error.Message);
                	    });
                	};

                	function userTaskHourPersist(taskHour) {
                		var payload = {
                			RowId: taskHour.RowId,
                			UserTaskRowId: $scope.userTask.RowId,
                			TotalBillableHours: parseFloat(taskHour.TotalBillableHours) || 0,
                			TotalHours: parseFloat(taskHour.TotalHours) || 0,
                			ServiceTechRowId: taskHour.RowId == 0 ? authService.getAuthInfo().userRowId : taskHour.ServiceTechRowId,
                			Notes: taskHour.Notes,
                            StartTime: moment(taskHour.StartTime).format("HH:mm"),
                            EndTime: moment(taskHour.EndTime).format("HH:mm")
                		};
                		if ($scope.userTask && $scope.userTask.Opcode) {
                		    if (taskHour.StartTime == null || taskHour.EndTime == null) {
                		        taskHour.StartTime = moment().set('hour', 0).set('minute', 0).set('second', 0);
                		        taskHour.EndTime = moment(taskHour.StartTime).add(payload.TotalHours, 'hours');
                		    }
                		    var dmPayload = {
                		        "TechId": authService.getAuthInfo().dmTechId,
                		        "WorkOrderId": $scope.userTask.WorkOrderId,
                		        "OpCode": $scope.userTask.Opcode,
                		        "Date": moment().format("MM/DD/YYYY"),
                		        "StartTime": moment(taskHour.StartTime).format("HH:mm"),
                		        "StopTime": moment(taskHour.EndTime).format("HH:mm"),
                		        "Comments": taskHour.Notes
                		    };
                		    if (isAzureServiceBusIntegrationEnabled === 'True') {
                		        azureServiceBusQueueService.sendMessage(authService.getAuthInfo().dmEndpoint, dmPayload).then(function (results) {
                		            persistHoursToMTI(payload, taskHour);
                		        });
                		    } else {
                		        userTaskHourDataServiceDM.submitTimeEntry(authService.getAuthInfo().dmEndpoint, dmPayload).then(function (results) {
                		            persistHoursToMTI(payload, taskHour);
                		        });
                		    }
                		} else {
                		    persistHoursToMTI(payload, taskHour);
                        } 
                	};

                	function deleteParts() {
                		return $q.all(_.map($scope.deleteParts, function (part) {
                			return dataService.remove('UserTaskPart', part.RowId);
                		}));
                	}

                	function saveParts(taskHour) {
                		return $q.all(_.map(taskHour.UserTaskParts, function (part) {
                			if (!part.RowId) {
                				part.UserTaskHourId = taskHour.RowId;
                				return dataService.add('UserTaskPart', part);
                			}
                		}));
                	}

                	function deleteLinkedMedia() {
                		return $q.all(_.map($scope.deleteFiles, function (file) {
                			return linkedMediaDataService.deleteLinkedMedia(file.RowId);
                		}));
                	}

                	function addLinkedMedia(taskHour) {
                		return $q.all(_.map(taskHour.Receipts, function (file) {
                			if (!file.RowId) {
                				var deferred = $q.defer();
                				var documentUploadData = {
                					FileUploadParentTypeId: 20,
                					FileUploadParentType: 'LOGHOUR',
                					FileUploadParentObjectGuid: taskHour.RowGuid,
                					FileUploadParentRowId: taskHour.RowId,
                					description: file.name,
                					IsActive: true
                				};
                				file.upload = $upload.upload({
                					url: API_BASE_URL + 'addmedia',
                					data: documentUploadData,
                					file: file
                				}).success(function (data, status, headers, config) {
                					console.log('file ' + config.file.name + ' is uploaded successfully');
                					deferred.resolve(data);
                				}).error(function () {
                					console.log('file ' + config.file.name + ' failed');
                					deferred.reject(config.file.name);
                				});
                			}
                		}));
                	};

                	function userTaskHourDelete(userTaskHourId) {
                		var confirm = window.confirm('Are you sure you want to remove this log entry?');
                		if (confirm) {
                			dataService.remove('UserTaskHour', userTaskHourId).then(function (result) {
                				reset();
                			}, function (error) {
                				toastr.error(error.Message);
                			});
                		}
                	};

                	function addPart(partNumber) {
                		if (partNumber.length > 0) {
                			var newPart = {
                				Name: partNumber,
                				Description: partNumber + ' description',
                				UserTaskHourId: 0
                			};
                			$scope.userTaskHour.UserTaskParts.push(newPart);
                			$scope.userTaskHour.ItemNumber = ''; // reset input
                		}
                	};

                	function deletePart(p, ind) {
                		if (p.RowId) {
                			$scope.deleteParts.push(p);
                		}
                		$scope.userTaskHour.UserTaskParts.splice(ind, 1);
                	};

                	function addFiles() {
                		$.each($scope.uploadFiles, function () {
                			$scope.userTaskHour.Receipts.push(this);
                		});
                	};

                	function deleteFile(f, ind) {
                		if (f.RowId) {
                			$scope.deleteFiles.push(f);
                		}
                		$scope.userTaskHour.Receipts.splice(ind, 1);
                	};

                    function updateTotalHours() {
                        if($scope.userTaskHour.EndTime && $scope.userTaskHour.StartTime) {
                            var end = moment($scope.userTaskHour.EndTime);
                            var start = moment($scope.userTaskHour.StartTime);
                            var duration = +moment.duration(end.diff(start)).asHours().toFixed(2);
                            $scope.userTaskHour.TotalHours = duration > 0 ? duration : 0;
                        }
                    };

                    $scope.openModal = function (receipt) {
                        var modalInstance = $modal.open({
                            animation: true,
                            size: 'lg',
                            templateUrl: 'viewReceipt.html',
                            controller: ['$scope', '$modalInstance', 'receipt', function ($scope, $modalInstance, receipt) {
                                $scope.receipt = receipt;

                                $scope.close = function () {
                                    $modalInstance.dismiss('cancel');
                                };
                            }],
                            resolve: {
                                receipt: function () {
                                    return receipt;
                                }
                            }
                        })
                    }

                	angular.extend($scope, {
                		isBusinessServiceTech: false,
                		isBusinessSupervisor: false,
                		userTaskHours: [],
                		userTaskHour: {
                			RowId: 0,
                			UserTaskParts: [],
                			ItemNumber: '',
                			Receipts: [],
                		},
                		uploadFiles: [],
                		deleteFiles: [],
                		newParts: [],
                		deleteParts: [],
                		uploadCounter: 0,
                		userTaskHourRead: userTaskHourRead,
                		userTaskHourSearch: userTaskHourSearch,
                		userTaskHourPersist: userTaskHourPersist,
                		userTaskHourDelete: userTaskHourDelete,
                		addPart: addPart,
                		deletePart: deletePart,
                		addFiles: addFiles,
                		deleteFile: deleteFile,
                		reset: reset,
                		initialize: initialize,
                        updateTotalHours: updateTotalHours
                	});

                }],
    		link: function (scope) {
    			scope.isBusinessServiceTech = scope.$parent.isBusinessServiceTech;
    			scope.isBusinessSupervisor = scope.$parent.isBusinessSupervisor;
    			scope.$parent.$parent.$watch('isOpen', function (open) {
    				if (open) {
    					scope.isLoading = true;
    					scope.initialize();
    				}
    			})
    		}
    	};
    }]);