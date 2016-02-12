angular.module('myVillages.tasker.app.userTaskOpsCodes')
    .factory('userTaskOpsCodesDataServiceDM', ['DM_API_KEY', '$http', '$q',
        function (DM_API_KEY, $http, $q) {
            'use strict';

            var getOpCodes = function (dmEndpoint) {
                var deferred = $q.defer();
                $http({ 
                    method: 'GET', 
                    url: dmEndpoint + 'Service/WorkOrders/RetrieveOperations',
                    headers: {
                            'IntegratorAppSecret': DM_API_KEY
                    },
                    cache: true
                }).then(function (result) {
                    deferred.resolve(result.data);
                }, function (result) {
                    toastr.error(result.statusText);
                    deferred.reject(result.statusText);
                });
                return deferred.promise;
            };

            return {
                getOpCodes: getOpCodes
            };
        }
    ]);
