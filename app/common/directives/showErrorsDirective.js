angular.module('myVillages.tasker.app.common.directives').
    directive('showErrors', ['$timeout', function ($timeout) {
        return {
            restrict: 'A',
            require: '^form',
            link: function (scope, element, attrs, formCtrl) {
                var inputEl = element[0].querySelector("[name]");
                var inputNgEl = angular.element(inputEl);
                var inputName = inputNgEl.attr('name');
                var blurred = false;

                inputNgEl.bind('blur', function () {
                    blurred = true;
                    element.toggleClass('has-error', formCtrl[inputName].$invalid);
                    toggleBorderError();
                });
                scope.$watch(function () {
                    return formCtrl[inputName].$invalid
                }, function (invalid) {
                    // we only want to toggle the has-error class after the blur
                    // event or if the control becomes valid
                    if (!blurred && invalid) { return }
                    element.toggleClass('has-error', invalid);
                    toggleBorderError();
                });
                scope.$on('show-errors-check-validity', function () {
                    element.toggleClass('has-error', formCtrl[inputName].$invalid);
                    toggleBorderError();
                });
                scope.$on('show-errors-reset', function () {
                    $timeout(function () { element.removeClass('has-error'); }, 0, false);
                    toggleBorderError(false);
                });

                var toggleBorderError = function (showError) {
                    var isError = false;
                    if (showError != undefined && showError != null) {
                        isError = showError;
                    } else {
                        isError = formCtrl[inputName].$invalid;
                    }
                    if (isError) {
                        inputNgEl[0].style["border-color"] = "rgb(185, 74, 72)";
                    } else {
                        inputNgEl[0].style["border-color"] = "rgb(238, 238, 238)";
                    }
                };
            }
        };
    }]);