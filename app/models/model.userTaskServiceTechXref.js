(function (tk) {
	'use strict';

	tk.UserTaskServiceTechXref = function () {

		var self = Object.create(tk.Entity());
		$.extend(self, {
			UserTaskRowId: '',
			ServiceTechRowId: '',
			ServiceTechEmail: '',
            AssignedBy: ''
		});
		return self;
	};
})(MyVillages.TaskerApp);