(function (tk) {
	'use strict';

	tk.UserTaskEstimate = function () {

		var self = Object.create(tk.Entity());
		$.extend(self, {
			UserTaskRowId: '',
			Estimate: ''
		});
		return self;
	};
})(MyVillages.TaskerApp);