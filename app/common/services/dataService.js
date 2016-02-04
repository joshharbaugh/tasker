angular.module('myVillages.tasker.app.common.services')
    .factory('dataService', ['API_BASE_URL', '$http', '$q', function (API_BASE_URL, $http, $q) {

        var getUrl = function (relativeUrl) {
            return API_BASE_URL + 'api/' + relativeUrl;
        };

        var ajaxRequest = function (relativeUrl, requestType, params, data) {
            var url = getUrl(relativeUrl);
            var deferred = $q.defer();
            $http({ method: requestType, url: url, params: params, data: data })
                .success(function (result, status) {
                    deferred.resolve(result);
                })
                .error(function (result, status) {
                    if (result) {
                    	if (result.Message) {
                    		toastr.error(result.Message);
                    	}
                    	else {
                    		toastr.error(result.statusText);
                    	}
                    }
                    else if (status) {
                        toastr.error(status);
                    }
                    deferred.reject(result);
                });
            return deferred.promise;
        },
        getAll = function (entityName, searchParameters) {
            var relativeUrl = entityName;
            return ajaxRequest(relativeUrl, 'GET', searchParameters, {});
        },
        get = function (entityName, id) {
            var relativeUrl = entityName + '/' + id;
            return ajaxRequest(relativeUrl, 'GET', {}, {});
        },
        add = function (entityName, entity, params) {
            var relativeUrl = entityName;
            params = params || {};
            return ajaxRequest(relativeUrl, 'POST', params, entity);
        },
        update = function (entityName, id, entity) {
            var relativeUrl = entityName + '/' + id;
            return ajaxRequest(relativeUrl, 'PUT', {}, entity);
        },
        remove = function (entityName, id) {
            var relativeUrl = entityName + '/' + id;
            return ajaxRequest(relativeUrl, 'DELETE', {}, {});
        };

        return {
            getAll: getAll,
            get: get,
            add: add,
            update: update,
            remove: remove
        };
    }])

    .factory('appStorage', [function () {
        var keyPrefix = 'tasker-';

        return {
            prefixKey: function (key) {
                return keyPrefix + key;
            },

            put: function (key, value) {
                key = this.prefixKey(key);
                value = JSON.stringify(value);
                localStorage.setItem(key, value);
            },

            get: function (key) {
                key = this.prefixKey(key);
                var value = localStorage.getItem(key);
                return JSON.parse(value);
            },

            erase: function (key) {
                key = this.prefixKey(key);
                localStorage.removeItem(key);
            },

            flush: function () {
                while (localStorage.length) {
                    localStorage.removeItem(localStorage.key(0));
                }
            }
        };

    }]);