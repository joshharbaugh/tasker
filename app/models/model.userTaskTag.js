(function (tk) {
	'use strict';

	tk.UserTaskTag = function () {

		var self = Object.create(tk.Entity());
		$.extend(self, {
			UserTaskRowId: '',
			Tag: ''
		});
		return self;
	};
})(MyVillages.TaskerApp);