angular.module('myVillages.tasker.app.azureServiceBus')
    .factory('azureServiceBusQueueService', ['API_BASE_URL', '$http', '$q',
        function (API_BASE_URL, $http, $q) {
            'use strict';
            var errMessage = "Error sending message to Azure Service Bus Queue"
            var sendMessage = function (dmEndpoint, serviceRequestArgs) {
                var dataSyncMessage = {
                        MessageType : 1,
                        EndpointUrl : dmEndpoint + 'Service/WorkOrders/SubmitTimeEntry',
                        Data : JSON.stringify(serviceRequestArgs)
                    };
                var deferred = $q.defer();
                $http({ 
                    method: 'POST', 
                    url: API_BASE_URL + 'api/azureservicebus/queue',
                    data: dataSyncMessage
                }).then(function (result) {
                    deferred.resolve(result.data);
                }, function (result) {
                    toastr.error(errMessage);
                    deferred.reject(errMessage);
                });
                return deferred.promise;
            };

            return {
                sendMessage: sendMessage
            };
        }
    ]);