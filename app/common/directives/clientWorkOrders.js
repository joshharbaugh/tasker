angular.module('myVillages.tasker.app.common.directives').
    directive('tkClientWorkOrders', ['userTaskDataServiceDM', function (userTaskDataServiceDM) {
        return {
            restrict: "E",
            scope: {
                vm: "=viewModel",
                dmEndpoint: "=dmEndpoint"
            },
            replace: true,
            template: '<select ng-disabled="!vm.IsWorkOrder || !vm.ClientWorkOrders" class="form-control input-sm selectpicker work-order-select" data-show-subtext="true" data-live-search="true" selectpicker ng-change="toggleWorkOrderDropdowns(\'workorder\')" ng-model="vm.selectedWorkOrderToLink" data-none-selected-text="Select Work Order" ng-options="workOrder as workOrder.Id + \' - \' + workOrder.Customer + \' \' + workOrder.OpenDate group by workOrder.Status for workOrder in vm.ClientWorkOrders | orderBy : \'-Status\'">' +
                '<option value="">Select Work Order</option>'+
            '</select>',
            controller: ['$scope', '$rootScope', '$timeout', '$filter', function ($scope, $rootScope, $timeout, $filter) {
                $scope.vm.selectedWorkOrderToLink = null;

                function getWorkOrders() {
                    userTaskDataServiceDM.searchWorkOrders($scope.dmEndpoint, $scope.vm.IntegrationKey).then(function (results) {
                        $scope.vm.ClientWorkOrders = _.map(results, function (result) { result.Status = result.Status === 'O' ? 'Open' : 'Closed'; return result; })
                    });
                };

                function getWorkOrderLookups() {
                    if ($scope.vm.IntegrationKey !== null && $scope.vm.gotOpCodes !== true) {
                        getWorkOrders();
                        $scope.vm.gotOpCodes = true;
                        $scope.vm.createWO = 'Create Work Order Estimate';
                    }
                };

                function toggleWorkOrderDropdowns(dropdown) {
                    $rootScope.$broadcast('event:toggleWorkOrderDropdowns', { dropdown: dropdown })
                }

                $rootScope.$on('event:toggleWorkOrderDropdowns', function (event, args) {
                    if (args.dropdown) {
                        if (args.dropdown !== 'workorder') {
                            $timeout(function () {
                                $scope.vm.selectedWorkOrderToLink = null;
                                $scope.vm.createWO = 'Create Work Order Estimate';
                                $('.work-order-select').selectpicker('val', '');
                            })                            
                        }
                    }
                })

                getWorkOrderLookups()

                angular.extend($scope, {
                    toggleWorkOrderDropdowns: toggleWorkOrderDropdowns
                })
            }]
        };
    }]);