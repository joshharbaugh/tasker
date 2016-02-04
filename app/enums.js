'use strict';

angular.module('myVillages.tasker.app.enums')
    .constant('taskStatus', {
    	AssignedToMe: -2,
    	All: -1,
    	NotAssigned: 0,
    	Posted: 1,
    	PendingEstimate: 2,
    	AwaitingApproval: 3,
    	EstimateApproved: 4,
    	EstimateRejected: 5,
    	InProgress: 6,
    	Completed: 7,
    	Cancelled: 8,
    	ServiceTechNotStarted: 9,
    	ServiceTechInProgress: 10,
    	ServiceTechCompleted: 11,
    	Open: 12,
    	AwaitingClientApproval: 13,
    	Approved: 14,
    	SharedWithMe: 15,
    	SubcontractorNotStarted: 16,
    	SubcontractorInProgress: 17,
    	SubcontractorCompleted: 18
    })
    .constant('taskerPermission', {
    	DenyCreatingClientTask: 1,
    	DenyEditClientTask: 2,
    	DenyViewingTaskHistory: 3
    })
    .constant('taskAction', {
    	DeleteTask: 1,
    	CancelTask: 2,
    	ProvideEstimate: 3,
    	RejectEstimate: 4,
    	ApproveEstimate: 5,
    	ApproveTask: 6,
    	AssignUser: 7,
    	AssignServiceTech: 8,
    	StartTask: 9,
    	ServiceTechStartTask: 10,
    	ServiceTechCompleteTask: 11,
    	SubcontractorStartTask: 12,
    	SubcontractorCompleteTask: 13,
    	CompleteTask: 14
    })
    .constant('linkedListType', {
    	ProviderList: 1,
    	ServiceTechList: 2,
    	SubcontractorList: 3,
    	SupervisorList: 4,
    })
    .constant('taskQueue', {
    	All: 0,
    	Open: 1,
    	AssignedToMe: 2,
    	SharedWithMe: 3,
    	AwaitingApproval: 4,
    	Completed: 5,
    	OtherSupervisor: 6
    })
    .constant('userTaskEquipment', {
    	None: 0,
    	EquipmentPosted: 1,
    	EquipmentModified: 2,
    })
	.constant('reminderActionKeywords', {
		TaskIt: 1,
		SnoozeIt: 2,
		DismissIt: 3,
		UnSnoozeIt: 4,
	})
	.constant('heartBeatInterval', {
		Today: 1,
		ThisWeek: 2,
		ThisMonth: 3,
		MostRecent: 4,
	})
    .constant('datetimeFilters', {
        'today': window.moment().toISOString(), // now
        'this_week': window.moment().subtract(window.moment().isoWeekday()-1, 'days').toISOString(), // now - day of week (1=Monday, 7=Sunday)
        'this_month': window.moment().subtract(window.moment().date()-1, 'days').toISOString() // now - (date of month)
    });