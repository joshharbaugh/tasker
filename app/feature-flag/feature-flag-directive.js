'use strict'

module.exports = FeatureFlagDirective

function FeatureFlagDirective(iFetchFeatureFlag) {

    return {
        restrict : 'A',
        link : function($scope, $el, attrs) {
            var config = $scope.$eval(attrs.featureFlag),
                hideClass = 'feature-flag-hide'
                ;

            $el.addClass(hideClass)

            iFetchFeatureFlag(config).then(function(active) {
                if(!active) {
                    $el.remove()
                } else {
                    $el.removeClass(hideClass)
                }
            })
        }
    }
}

FeatureFlagDirective.$inject = [
    'iFetchFeatureFlag'
]