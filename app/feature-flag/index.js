'use strict';

/**
 * @module FeatureFlag
 * */
module.exports = buildModule

buildModule.prod = {
   cache : true
}

function buildModule(moduleName, cfg) {

   var angular = require('angular')

   var mod = angular.module(moduleName || 'feature-flag',[])

   mod.factory('lodash', function() {
      return require('lodash')
   })
   mod.factory('Map', function() {
      return require('es6-map')
   })

   mod.factory('iFetchFeatureFlag', require('./i-fetch-feature-flag'))
   mod.directive('featureFlag', require('./feature-flag-directive'))

   mod.provider('cacheFeatureFlagDecorator', require('./cache-feature-flag-decorator'))

   if(cfg && cfg.cache) {
      mod.config([
         '$provide',
         'cacheFeatureFlagDecoratorProvider',
         function($provide, cacheFeatureFlagDecorator) {
            $provide.decorator('iFetchFeatureFlag', cacheFeatureFlagDecorator.$get)
         }])
   }

   return mod
}