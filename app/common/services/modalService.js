angular.module('myVillages.tasker.app.common.services').service('modalService', ['$modal',
    function ($modal) {

        var modalDefaults = {
            backdrop: true,
            keyboard: true,
            modalFade: true,
            templateUrl: '/Scripts/tasker/app/common/partials/modal.html'
        };

        var modalOptions = {
            closeButtonText: 'Close',
            actionButtonText: 'OK',
            headerText: 'Proceed?',
            bodyText: 'Perform this action?',
            stopBugging: false
        };

        this.showModal = function (customModalDefaults, customModalOptions) {
            if (!customModalDefaults) customModalDefaults = {};
            customModalDefaults.backdrop = 'static';
            return this.show(customModalDefaults, customModalOptions);
        };

        this.show = function (customModalDefaults, customModalOptions) {
            //Create temp objects to work with since we're in a singleton service
            var tempModalDefaults = {};
            var tempModalOptions = {};

            //Map angular-ui modal custom defaults to modal defaults defined in service
            angular.extend(tempModalDefaults, modalDefaults, customModalDefaults);

            //Map modal.html $scope custom properties to defaults defined in service
            angular.extend(tempModalOptions, modalOptions, customModalOptions);

            if (!tempModalDefaults.controller) {
                tempModalDefaults.controller = ['$scope', '$modalInstance', function ($scope, $modalInstance) {
                    $scope.modalOptions = tempModalOptions;
                    $scope.modalOptions.ok = function (result) {
                        var returnResult = createResultObject(true, $scope.modalOptions.stopBugging);
                        $modalInstance.close(returnResult);
                    };
                    $scope.modalOptions.close = function (result) {
                        var returnResult = createResultObject(false, $scope.modalOptions.stopBugging);
                        $modalInstance.close(returnResult);
                    };
                }];
            }
            
            return $modal.open(tempModalDefaults).result;
        };

        var createResultObject = function (dialogResult, stopBugging) {
            var obj = {
                DialogResult: dialogResult,
                StopPromptingMe: stopBugging
            };
            return obj;
        }
    }]);