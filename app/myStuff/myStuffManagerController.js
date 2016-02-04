angular.module('myVillages.tasker.app.userTask')
    .controller('MyStuffManagerController', ['$scope', 'authService', 'dataService', '$modal', '$location',
        function ($scope, authService, dataService, $modal, $location) {
        	'use strict';
        	var userRowId = authService.getAuthInfo().userRowId;

        	function initialize() {
        		getMyStuff();
        	};

        	function getMyStuff() {
        		var toySearchArgs = {
        			OwnerId: userRowId,
        			OrderBy: 'DateCreated'
        		};
        		dataService.getAll('MyStuff', toySearchArgs, {}).then(function (result) {
        			$scope.userToys = result;
        		});
			};

        	function toggleFlyoutMenu(e) {
        		e.preventDefault();
        		var $target = $(e.target);
        		var menu = $target.parent().find(".menu");
        		if (menu.length) {
        			if (menu.is(":visible")) {
        				menu.hide();
        			} else {
        				$(".menu").hide();
        				menu.show();
        			}
        		}
        	};

        	initialize();

        	angular.extend($scope, {
        		userToys: [],
        		getMyStuff: getMyStuff,
        		toggleFlyoutMenu: toggleFlyoutMenu
        	});

        }
    ]);