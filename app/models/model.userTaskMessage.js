(function (tk) {
	'use strict';

	tk.UserTaskMessage = function () {

		var self = Object.create(tk.Entity());
		$.extend(self, {
			UserTaskRowId: '',
			Message: '',
			VisibleByOwner: true,
			Metadata: ''
		});
		return self;
	};
})(MyVillages.TaskerApp);