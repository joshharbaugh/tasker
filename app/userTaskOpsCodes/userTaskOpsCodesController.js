angular.module('myVillages.tasker.app.userTaskOpsCodes')
    .controller('UserTaskOpsCodesController', ['$scope', 'authService', 'userTaskOpsCodesDataServiceDM', 'userTaskDataService', 'userTaskDataServiceDM',
		function ($scope, authService, userTaskOpsCodesDataServiceDM, userTaskDataService, userTaskDataServiceDM) {
		    'use strict';
		    var dmEndpoint = authService.getAuthInfo().dmEndpoint;
		    var userRowId = authService.getAuthInfo().userRowId;

			angular.extend($scope, {
                newOpCode: MyVillages.TaskerApp.UserTask(),
                cancel: cancel,
                saveOpCodes: saveOpCodes
		    });

			function initialize() {
			    $scope.newOpCode.UserRowId = $scope.$parent.taskGroup.GroupTasks[0].UserRowId;
			    $scope.newOpCode.AssignedUserRowId = $scope.$parent.taskGroup.GroupTasks[0].AssignedUserRowId;
			    userTaskOpsCodesDataServiceDM.getOpCodes(dmEndpoint).then(function (results) {
			        $scope.OpCodes = results;
			        _.each(results, function (obj) {
			            var _option = angular.element("<option></option>");
			            _option.attr('value', obj.Opcode);
                        _option.html(obj.Opcode + ' - ' + obj.Desc);
			            angular.element("#opcodesSelect").append(_option);
			        });
			        $('#opcodesSelect').selectpicker('refresh');
			    });
			};

		    initialize();

            function cancel(){
                $scope.$parent.$parent.addingOpCode[$scope.$parent.taskGroup.RowId] = false;
            };

            function saveOpCodes() {
                var opCodes = [];
                _.each($scope.newOpCode.OpCodes, function(obj) {
                    opCodes.push(_.findWhere($scope.OpCodes, { Opcode: obj }));
                });

				 var serviceRequestArgs = {
				 	"WOId": $scope.$parent.taskGroup.WorkOrderId,
                 	"CustId": $scope.$parent.taskGroup.IntegrationKey,
                 	"OperationCodes": opCodes
                } 
				userTaskDataServiceDM.saveServiceRequest(dmEndpoint, serviceRequestArgs).then(function (result) {
        	        if(result.Result.indexOf("is locked") > -1){
                        toastr.error('RECORD IS LOCKED IN Dockmaster Pro!<br/>Op Code not added!');
        	        	return;
        	        }
        	        var tasks = [];

        	        _.each(opCodes, function (obj) {
        	            var opCode = angular.copy($scope.newOpCode);
	                    opCode.AssignedUserRowId = userRowId;
	                    opCode.IsStatusChange = true;
	                    opCode.Status = "Posted";
	                    opCode.Title = obj.Desc;
	                    opCode.Opcode = obj.Opcode;
	                    opCode.CreatedBy = userRowId;
        	            tasks.push(opCode);
        	        });

        	        userTaskDataService.saveMany(tasks).then(function (result) {
                        $scope.newOpCode = MyVillages.TaskerApp.UserTask();
                        toastr.success('Op Codes has been posted');
                        _.each(result, function (obj) {
                            $scope.notifyParent({ newUserTask: obj });
                        });
	                });
                });
            };
		}
    ]);