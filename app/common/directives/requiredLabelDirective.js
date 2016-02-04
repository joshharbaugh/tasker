angular.module('myVillages.tasker.app.common.directives').
    directive('tkRequiredLabel', [function () {
        return {
            restrict: 'A',
            link: function (scope, element) {
                var html = angular.element('<span class="star">*</span>');
                element.append(html);
            }
        };
    }]);