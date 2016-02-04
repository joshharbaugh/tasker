(function ($) {
	'use strict';

    // Declare app level module which depends on filters, and services
    var depList = [
		'ngRoute',
		'ui.bootstrap',
        'ui.sortable',
        'ui.scrollpoint',
        'ui.grid',
        'ui.grid.draggable-rows',   
		'ngAnimate',
		'ngCookies',
        'ngKookies',
        'ngTouch',
		'angular-loading-bar',
		'xeditable',
		'ngTagsInput',
        'ngDraggable',
		'ng-currency',
		'angularFileUpload',
        'mgcrea.ngStrap.affix',
        'angularMoment',
        'myVillages.tasker.app.config',
		'myVillages.tasker.app.enums',
		'myVillages.tasker.app.common.services',
        'myVillages.tasker.app.common.directives',
        'myVillages.tasker.app.userTask',
        'myVillages.tasker.app.bulkActionsMenu',
        'myVillages.tasker.app.userTaskOpsCodes',
		'myVillages.tasker.app.assignListTasks',
		'myVillages.tasker.app.reassignSupervisor',
		'myVillages.tasker.app.assignServiceTech',
		'myVillages.tasker.app.assignSubcontractor',
		'myVillages.tasker.app.userTasksUserXref',
		'myVillages.tasker.app.userTaskMessages',
        'myVillages.tasker.app.equipmentSelector',
		'myVillages.tasker.app.linkedMedia',
		'myVillages.tasker.app.userTaskPermissions',
        'myVillages.tasker.app.userTaskSmartGroup',
        'myVillages.tasker.app.serviceTech',
        'myVillages.tasker.app.userTaskServiceTech',
        'myVillages.tasker.app.tutorial',
        'myVillages.tasker.app.userTaskQueue',
        'mytaskit.integration.appView',
        'myVillages.tasker.app.supervisor',
        'myVillages.tasker.app.heartbeat',
        'myVillages.tasker.app.heartbeat.directives',
        'myVillages.tasker.app.userTaskGrid',
        'myVillages.tasker.app.azureServiceBus'
    ]
    if (document.location.href.indexOf('local') === -1) {
        // Only need this module in QA / Staging / Production environments
        depList.unshift('myVillages.tasker.app.templates')
    }
    angular.module('myVillages.tasker.app', depList)
    .config(['$routeProvider', '$httpProvider', function ($routeProvider, $httpProvider) {
    	configureRouting();
    	$httpProvider.interceptors.push('authInterceptorService');

    	function configureRouting() {
    		$routeProvider.when('/tasks',
            {
            	templateUrl: '/Scripts/tasker/app/userTask/userTaskManager.html',
            	controller: 'UserTaskManagerController',
                reloadOnSearch: false
            });

    		$routeProvider.when('/tasksgrid',
            {
                templateUrl: '/Scripts/tasker/app/userTaskGrid/userTaskGrid.html',
                controller: 'UserTaskGridController',
                reloadOnSearch: false
            });

    		$routeProvider.when('/mystuff',
            {
            	templateUrl: '/Scripts/tasker/app/myStuff/myStuffManager.html',
            	controller: 'MyStuffManagerController'
            });
    		$routeProvider.when('/permissions',
            {
            	templateUrl: '/Scripts/tasker/app/userTaskPermissions/permissionsManager.html',
            	controller: 'UserTaskPermissionsController'
            });
    		$routeProvider.when('/heartbeat',
            {
                templateUrl: '/Scripts/tasker/app/heartbeat/dashboard.html',
                controller: 'HeartbeatDashboardController'
            })
    		$routeProvider.otherwise({ redirectTo: '/tasks' });
    	};
    }])
    .run(['$rootScope', '$location', 'authService', 'editableOptions', function ($rootScope, $location, authService, editableOptions) {
    	editableOptions.theme = 'bs3';
    	var authInfo = {
    		isAuthenticated: true,
    		token: window.authToken,
    		userRowId: window.userRowId,
    		userName: window.userName,
    		userDisplayName: window.userDisplayName,
    		userCategory: window.userCategoryToken,
    		isBusinessSupervisor: window.isBusinessSupervisor,
            businessRowId: window.businessRowId,
            userPermissions: window.userPermissions,
            dmEndpoint: window.dmEndpoint,
            dmTechId: window.dmTechId,
            isWorkOrderIntegrationEnabled: window.isWorkOrderIntegrationEnabled,
            isAzureServiceBusIntegrationEnabled: window.isAzureServiceBusIntegrationEnabled
    	};
    	authService.setAuthInfo(authInfo)
    	authService.getCurrentUser()
        .then(function (user) {
            if ((user.IsBusiness && user.IsPremiumUser) &&
                (authInfo.userCategory !== user.UserCategoryToken) &&
                (parseInt(authInfo.userRowId) === user.RowId)) {
                authInfo.userCategory = user.UserCategoryToken
                authService.setAuthInfo(authInfo)
            }
        })
    	var addActive = function (elementId) {
    	    if (!$(elementId).hasClass('active')) {
    	        $(elementId).addClass('active');
    	    }
    	};
    	var clearActive = function (elementId) {
    	    if ($(elementId).hasClass('active')) {
    	        $(elementId).removeClass('active');
    	    }
    	};



    	

    	$rootScope.isMobile = window.isMobile();
    	$rootScope.$on("$routeChangeStart", function (event, next, current) {
    		if (!authService.isAuthenticated()) {
    			location.href = "/";
    		}
    		if (next && next.controller) {
    		    switch (next.controller) {
    		        case "UserTaskManagerController":
    		            clearActive('#limystuff');
    		            addActive('#litasks');
    		            addActive('#limytasks');
    		            if ($('#subNav').is(':hidden')) {
    		                $('#subNav').show(100);
    		            }
    		            break;
    		        case "MyStuffManagerController":
    		            clearActive('#litasks');
    		            clearActive('#limytasks');
    		            addActive('#limystuff');
    		            if ($('#subNav').is(':visible')) {
    		                $('#subNav').hide(100);
    		            }
    		            break;
    		        case "UserTaskPermissionsController":
    		            clearActive('#litasks');
    		            clearActive('#limytasks');
    		            clearActive('#limystuff');
    		            if ($('#subNav').is(':visible')) {
    		                $('#subNav').hide(100);
    		            }
    		            break;
    		        default:
    		    }
    		}
    	});
    }]);

	angular.module('myVillages.tasker.app.config', []);
	angular.module('myVillages.tasker.app.enums', []);
	angular.module('myVillages.tasker.app.common.services', []);
	angular.module('myVillages.tasker.app.common.directives', [
        'angular-bootstrap-select',
        'angular-bootstrap-select.extra'
	]);
	angular.module('myVillages.tasker.app.userTask', []);
	angular.module('myVillages.tasker.app.userTaskOpsCodes', []);
	angular.module('myVillages.tasker.app.bulkActionsMenu', []);
	angular.module('myVillages.tasker.app.assignListTasks', []);
	angular.module('myVillages.tasker.app.reassignSupervisor', []);
	angular.module('myVillages.tasker.app.assignServiceTech', []);
	angular.module('myVillages.tasker.app.assignSubcontractor', []);
	angular.module('myVillages.tasker.app.userTaskMessages', []);
	angular.module('myVillages.tasker.app.userTasksUserXref', []);
	angular.module('myVillages.tasker.app.equipmentSelector', []);
	angular.module('myVillages.tasker.app.linkedMedia', []);
	angular.module('myVillages.tasker.app.userTaskPermissions', []);
	angular.module('myVillages.tasker.app.userTaskSmartGroup', []);
	angular.module('myVillages.tasker.app.serviceTech', []);
	angular.module('myVillages.tasker.app.userTaskServiceTech', []);
	angular.module('myVillages.tasker.app.tutorial', []);
	angular.module('myVillages.tasker.app.userTaskQueue', []);
    angular.module('mytaskit.integration.appView', []);
    angular.module('myVillages.tasker.app.supervisor', []);
    angular.module('myVillages.tasker.app.heartbeat', []);
    angular.module('myVillages.tasker.app.heartbeat.directives', []);
    angular.module('myVillages.tasker.app.azureServiceBus', []);

    angular.module('myVillages.tasker.app.userTaskGrid', [
    'ngTouch', 'ui.grid', 'ui.grid.expandable', 'ui.grid.moveColumns', 'ui.grid.selection',
     'ui.grid.treeView', 'ui.grid.pinning', 'ui.grid.exporter', 'ui.grid.resizeColumns', 'ui.grid.grouping'
    ]);
})(jQuery);