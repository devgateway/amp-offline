export const FULLSCREEN_ALERT_ADDED = 'FULLSCREEN_ALERT_ADDED';
export const FULLSCREEN_ALERT_WITH_FOLLOWUP_ADDED = 'FULLSCREEN_ALERT_WITH_FOLLOWUP_ADDED';

// notification is expected to be an instance of ../modules/helpers/NotificationHelper
export const addFullscreenAlert = notification => ({
  type: FULLSCREEN_ALERT_ADDED,
  notification
});

// notification is expected to be an instance of ../modules/helpers/NotificationHelper
// nextAction is the action to be dispatched
export const addFullscreenAlertWithFollowup = (notification, nextAction) => ({
  type: FULLSCREEN_ALERT_WITH_FOLLOWUP_ADDED,
  notification,
  nextAction
});
