'use strict';
angular.module('myVillages.tasker.app.common.services')
    .factory('authInterceptorService', ['$q', '$location', '$cookieStore', function ($q, $location, $cookieStore) {
        
        var authInterceptorServiceFactory = {};

        var _request = function (config) {

            config.headers = config.headers || {};

            var authInfo = $cookieStore.get('authInfo');
            if (authInfo && authInfo.isAuthenticated) {
                config.headers.Authorization = 'Bearer ' + authInfo.token;
            }

            return config;
        }

        var _responseError = function (rejection) {
            if (rejection.status === 401) {
                $location.path('/login');
            }
            return $q.reject(rejection);
        }

        authInterceptorServiceFactory.request = _request;
        authInterceptorServiceFactory.responseError = _responseError;

        return authInterceptorServiceFactory;
    }
    ]);