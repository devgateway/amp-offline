export const FULLSCREEN_ALERT_ADDED = 'FULLSCREEN_ALERT_ADDED';
export const FULLSCREEN_ALERT_DISMISSED = 'FULLSCREEN_ALERT_DISMISSED';
export const FULLSCREEN_ALERT_WITH_FOLLOWUP_ADDED = 'FULLSCREEN_ALERT_WITH_FOLLOWUP_ADDED';

// notification is expected to be an instance of ../modules/helpers/NotificationHelper
export const addFullscreenAlert = notification => ({
  type: FULLSCREEN_ALERT_ADDED,
  notification
});

// one argument - the notification to be dismissed
export const dismissFullscreenAlert = notification => ({
  type: FULLSCREEN_ALERT_DISMISSED,
  notification
});

// notification is expected to be an instance of ../modules/helpers/NotificationHelper
// callback is a function that will be called after the user dismisses the alert
// callback will be called with dispatch as its first argument
export const addFullscreenAlertWithFollowup = (notification, callback) => ({
  type: FULLSCREEN_ALERT_WITH_FOLLOWUP_ADDED,
  notification,
  callback
});
