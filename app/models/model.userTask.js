(function (tk) {
    'use strict';

    tk.UserTask = function () {

        var self = Object.create(tk.Entity());
        $.extend(self, {
			RowId: '',
            UserRowId: '',
            AssignedUserRowId: '',
            UserEmail: '',
            Title: '',
        	ToyRowId: '',
        	SelectedToyEquipmentIdsList: [],
            IsRequestEstimate: false,
        	IsRequestEstimateChecked: false,
        	EstimateAmount: null,
            RequestedCompletionDate: '',
        	Status: '',
        	IsStatusChange: false,
            Labor: '',
            Note: '',
            Feedbacks: [],
            Notes: [],
            SharedWith: [],
            SharedWithChecked: false,
            Rating: 0
        });
        return self;
    };
})(MyVillages.TaskerApp);