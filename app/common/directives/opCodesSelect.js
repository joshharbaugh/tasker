angular.module('myVillages.tasker.app.common.directives').
    directive('tkOpCodesSelect', ['userTaskOpsCodesDataServiceDM', function (userTaskOpsCodesDataServiceDM) {
        return {
            restrict: "E",
            scope: {
                vm: "=viewModel",
                dmEndpoint: "=dmEndpoint"
            },
            replace: true,
            template: '<select ng-disabled="!vm.IsWorkOrder || !vm.ClientOpCodes" data-drop-auto="false" class="selectpicker" data-show-subtext="true" data-live-search="true" selectpicker multiple data-selected-text-format="count>3" ng-change="toggleWorkOrderDropdowns(\'opcode\')" ng-model="vm.FirstOpCode" ng-options="OpCode as OpCode.Desc for OpCode in vm.ClientOpCodes" data-none-selected-text="Select Op Codes"><option value="">Select Op Codes</option></select>',
            controller: ['$scope', '$rootScope', '$timeout', function ($scope, $rootScope, $timeout) {
                $scope.vm.FirstOpCode = null;

                var refreshMultiDropdown = function () {
                    $timeout(function () {
                        $('.selectpicker').selectpicker('refresh');
                    });
                }

                function getOpCodes() {                    
                    userTaskOpsCodesDataServiceDM.getOpCodes($scope.dmEndpoint).then(function (results) {
                        for (var x in results) {
                            results[x].Desc = results[x].Opcode + ' - ' + results[x].Desc;
                        }
                        $scope.vm.ClientOpCodes = results;
                        refreshMultiDropdown();
                    });
                };

                function toggleWorkOrderDropdowns(dropdown) {
                    $rootScope.$broadcast('event:toggleWorkOrderDropdowns', {dropdown: dropdown})
                }

                $rootScope.$on('event:toggleWorkOrderDropdowns', function (event, args) {
                    if (args.dropdown) {
                        if (args.dropdown === 'workorder') {
                            $scope.vm.FirstOpCode = null;
                            $scope.vm.createWO = 'Sync Work Order';
                            refreshMultiDropdown();
                        }
                    }
                })

                getOpCodes()

                angular.extend($scope, {
                    toggleWorkOrderDropdowns: toggleWorkOrderDropdowns
                })
            }]
        };
    }]);