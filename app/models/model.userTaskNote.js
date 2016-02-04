(function (tk) {
	'use strict';

	tk.UserTaskNote = function () {
		var self = {
			RowId: undefined,
			RowGuid: undefined,
			DateCreated: undefined,
			DateLastMod: undefined,
			CreatedBy: undefined,
			LastModBy: undefined,
			UserTaskRowId: undefined,
			Note: undefined,
			CreatedByDisplayName: undefined,
			LastModByDisplayName: undefined
		};

		return self;
	};

})(MyVillages.TaskerApp);