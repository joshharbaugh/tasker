(function (tk) {
	'use strict';

	tk.UserTaskGroup = function () {

		var self = Object.create(tk.Entity());
		$.extend(self, {
			UserRowId: '',
			Title: '',
            UserTasks: []
		});
		return self;
	};
})(MyVillages.TaskerApp);