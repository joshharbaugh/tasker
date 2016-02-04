angular.module('myVillages.tasker.app.userTask')
    .factory('userTaskHourDataServiceDM', ['DM_API_KEY', '$http', '$q',
        function (DM_API_KEY, $http, $q) {
            'use strict';

            var submitTimeEntry = function (dmEndpoint, serviceRequestArgs) {
                var deferred = $q.defer();
                var dmErrorGenericText = 'Hours cannot be posted to this Workorder/Estimate';
                $http({ 
                    method: 'POST', 
                    url: dmEndpoint + 'Service/WorkOrders/SubmitTimeEntry',
                    headers: {
                            'IntegratorAppSecret': DM_API_KEY
                    },
                    data: serviceRequestArgs
                }).then(function (result) {
                    deferred.resolve(result.data);
                }, function (result) {
                    toastr.error(dmErrorGenericText);
                    deferred.reject(dmErrorGenericText);
                });
                return deferred.promise;
            };

            return {
                submitTimeEntry: submitTimeEntry
            };
        }
    ]);