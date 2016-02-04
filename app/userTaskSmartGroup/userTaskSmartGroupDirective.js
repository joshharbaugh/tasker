angular.module('myVillages.tasker.app.userTaskSmartGroup')
    .directive('tkUserTaskSmartGroup', [function () {
        return {
            restrict: 'E',
            scope: {
                userTaskSmartGroupRowId: '=',
                userTaskSmartGroupRowGuid: '='
            },
            templateUrl: '/Scripts/tasker/app/userTaskSmartGroup/userTaskSmartGroup.html',
            controller: ['$scope', 'UserTaskSmartGroupDataService', '$timeout', 'API_BASE_URL', 'authService',
				function ($scope, userTaskSmartGroupDataService, $timeout, API_BASE_URL, authService) {

				    $scope.userRowId = authService.getAuthInfo().userRowId;

				    function openSmartGroupModal() {
				        bootbox.dialog({
				            title: 'New MyPinboard',
				            message: '<div class="row">'+
                                '<div class="col-md-12">'+
                                '<form class="form-horizontal">'+
                                '<div class="form-group">'+
                                '<label class="col-md-4 control-label" for="myPinboardName">Name</label>' +
                                '<div class="col-md-8">'+
                                '<input id="myPinboardName" name="myPinboardName" type="text" placeholder="MyPinboard Name" class="form-control input-md">' +
                                '</div> </div> </div>'+
                                '</form> </div> </div>',
				            buttons: {
				                success: {
				                    label: "Create",
				                    className: "btn-success",
				                    callback: function () {
				                        var payload = {
				                            UserRowId: $scope.userRowId,
				                            ParentGroupId: null,
				                            Title: $('#myPinboardName').val()
				                        };
				                        PersistUserTaskSmartGroup(payload);
				                    }
				                }
				            }
				        });
				    }

				    function GetSmartGroup(id) {
				        userTaskSmartGroupDataService.GetSmartGroup(id).then(function (result) {
				            $scope.smartGroup = result;
				        });
				    }

				    function AddContactToSmartGroup() {
                        // mocked
				    };

				    function DeleteContactFromSmartGroup(args) {
				        /* RowId { get; set; }
				           long UserTaskSmartGroupId { get; set; }
				           long ContactRowId
                        */
				        userTaskSmartGroupDataService.DeleteContactFromSmartGroup(args).then(function (result) {
				            $scope.smartGroup = result;
				        });
				    };

				    function AddSubGroupToSmartGroup(args) { // args are of type ParentIdToChildIdArgs
				        userTaskSmartGroupDataService.AddSubGroupToSmartGroup(args).then(function (result) {
				            $scope.smartGroup = result;
				        });
				    };

				    function RemoveSubGroupFromSmartGroup(args) { // args are of type ParentIdToChildIdArgs
				        userTaskSmartGroupDataService.RemoveSubGroupFromSmartGroup(args).then(function (result) {
				            //$scope.smartGroup = result;
				        });
				    };

				    function PersistUserTaskSmartGroup(smartGroup) {
				        userTaskSmartGroupDataService.PersistUserTaskSmartGroup(smartGroup).then(function (result) {
				            $scope.smartGroup = result;
				        });
				    };

				    function DeleteUserTaskSmartGroup(id) {
				        userTaskSmartGroupDataService.DeleteUserTaskSmartGroup(id).then(function (result) {
				           // $scope.smartGroup = result;
				        });
				    };

				    function UserTaskSmartGroupSearch(args) {
				        userTaskSmartGroupDataService.UserTaskSmartGroupSearch(args).then(function (result) {
				            $scope.smartGroup = result;
				        });
				    };

				    function UserTaskSmartGroupReadAllTasks(id) {
				        userTaskSmartGroupDataService.UserTaskSmartGroupReadAllTasks(id).then(function (result) {
				            $scope.smartGroupTasks = result;
				        });
				    };

				    function UserTaskSmartGroupReadAllContacts(id) {
				        userTaskSmartGroupDataService.UserTaskSmartGroupReadAllContacts(id).then(function (result) {
				            $scope.smartGroupContacts = result;
				        });
				    };

				    angular.extend($scope, {
				        smartGroup: [],
				        openSmartGroupModal: openSmartGroupModal,
				        GetSmartGroup: GetSmartGroup,
				        AddContactToSmartGroup: AddContactToSmartGroup,
				        DeleteContactFromSmartGroup: DeleteContactFromSmartGroup,
				        AddSubGroupToSmartGroup: AddSubGroupToSmartGroup,
				        RemoveSubGroupFromSmartGroup: RemoveSubGroupFromSmartGroup,
				        PersistUserTaskSmartGroup: PersistUserTaskSmartGroup,
				        DeleteUserTaskSmartGroup: DeleteUserTaskSmartGroup,
				        UserTaskSmartGroupSearch: UserTaskSmartGroupSearch,
				        UserTaskSmartGroupReadAllTasks: UserTaskSmartGroupReadAllTasks,
				        UserTaskSmartGroupReadAllContacts: UserTaskSmartGroupReadAllContacts
				    });
				}],
            link: function (scope) {
                // Initial search on load
                var args = { RowId: null,
                             UserRowId: scope.userRowId,
                             keyword: null };
                scope.UserTaskSmartGroupSearch(args);
            }
            
        };
    }]);

