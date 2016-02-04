var appScriptFiles = [

    "initNs.js",
    "app.js",
    "config.js",
    "enums.js",

    "models/model.entity.js",
    "common/directives/requiredLabelDirective.js",
    "common/directives/backgroundUrlDirective.js",
    "common/directives/showErrorsDirective.js",
    "common/directives/breadcrumbsDirective.js",
    "common/directives/stickyDirective.js",
    "common/directives/workspaceDirective.js",

    "common/services/authService.js",
    "common/services/authInterceptorService.js",
    "common/services/dataService.js",
    "common/services/modalService.js",
    "common/services/debounceFactory.js",

    "models/model.userTask.js",

    "userTask/userTaskManagerController.js",
    "userTask/userTaskDataService.js",
    "userTask/userTaskDataServiceDM.js",
    "userTask/userTasksUserXrefDataService.js",
    "userTask/userTaskDirective.js",
    "userTask/createTaskDirective.js",

    "userTaskGrid/userTaskGridController.js",
    "userTaskGrid/userTaskGridDataService.js",
    "userTaskGrid/userTaskGridService.js",

    "bulkActionsMenu/bulkActionsMenuDirective.js",
    "assignListTasks/assignListTasksDirective.js",
    "reassignSupervisor/reassignSupervisorDirective.js",
    "assignServiceTech/assignServiceTechDirective.js",
    "assignSubcontractor/assignSubcontractorDirective.js",

    "models/model.userTaskMessage.js",
    "userTaskMessage/userTaskMessagesDirective.js",
    "userTaskMessage/userTaskMessagesDataService.js",

    "models/model.userTaskEstimate.js",

    "linkedMedia/linkedMediaDirective.js",
    "linkedMedia/linkedMediaDataService.js",
    "models/model.linkedMedia.js",

    "models/model.userTaskGroup.js",
    "userTaskGroup/userTaskGroupsDirective.js",

    "equipmentSelector/equipmentSelectorDirective.js",

    "userTaskSmartGroup/userTaskSmartGroupDataService.js",
    "userTaskSmartGroup/userTaskSmartGroupDirective.js",

    "userTaskPermissions/permissionsDataService.js",
    "userTaskPermissions/permissionsManagerController.js",

    "userTaskHour/userTaskHourDirective.js",
    "userTaskHour/userTaskHourDataServiceDM.js",
    "userTaskPart/userTaskPartController.js",

    "userTaskOpsCodes/userTaskOpsCodesController.js",
    "userTaskOpsCodes/userTaskOpsCodesDirective.js",
    "userTaskOpsCodes/userTaskOpsCodesDataService.js",
    "userTaskOpsCodes/userTaskOpsCodesDataServiceDM.js",

    "serviceTech/serviceTechDataService.js",
    "userTaskServiceTech/userTaskServiceTechDataService.js",

    "models/model.userTaskFeedback.js",
    "models/model.userTaskNote.js",

    "models/model.userTaskServiceTechXref.js",

    "tutorial/joyride.js",
    "tutorial/tutorialDirective.js",

    "supervisor/supervisorDataService.js",

    "heartbeat/heartbeatDashboardController.js",
    "heartbeat/datetimeFiltersDirective.js",
    "heartbeat/recentActivityDirective.js",
    "heartbeat/estimatesRequestedDirective.js",
    "heartbeat/clientRemindersDirective.js",
    "heartbeat/techStatusUpdatesDirective.js",
    "heartbeat/recentMessagesDirective.js",

    "azureServiceBus/azureServiceBusQueueService.js"
];

if (document.location.href.indexOf('local') === -1) {
    // Only need this in QA / Staging / Production environments
    appScriptFiles.unshift("templates.js")
}

function addFile(appFile) {
    var scriptDeclaration = '<script src="/Scripts/tasker/app/' + appFile + '"></script>';
    document.write(scriptDeclaration);
};

function loadAppScriptFiles() {
    for (var i = 0; i < appScriptFiles.length; i++) {
        addFile(appScriptFiles[i]);
    };
};
