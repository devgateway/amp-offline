export const FULLSCREEN_ALERT_ADDED = 'FULLSCREEN_ALERT_ADDED';
export const FULLSCREEN_ALERT_DISMISSED = 'FULLSCREEN_ALERT_DISMISSED';
export const FULLSCREEN_ALERT_WITH_FOLLOWUP_ADDED = 'FULLSCREEN_ALERT_WITH_FOLLOWUP_ADDED';
export const FULLSCREEN_ALERT_WITH_FOLLOWUP_DISMISSED = 'FULLSCREEN_ALERT_WITH_FOLLOWUP_DISMISSED';
export const CONFIRMATION_ALERT_ADDED = 'CONFIRMATION_ALERT';

// notification is expected to be an instance of ../modules/helpers/NotificationHelper
export const addFullscreenAlert = notification => ({
  type: FULLSCREEN_ALERT_ADDED,
  payload: notification
});

// one argument - the notification to be dismissed
export const dismissFullscreenAlert = notification => ({
  type: FULLSCREEN_ALERT_DISMISSED,
  payload: notification
});

// notification is expected to be an instance of ../modules/helpers/NotificationHelper
// nextAction is the action that will be dispatched after FULLSCREEN_ALERT_WITH_FOLLOWUP_DISMISSED
export const addFullscreenAlertWithFollowup = (notification, nextAction) => ({
  type: FULLSCREEN_ALERT_WITH_FOLLOWUP_ADDED,
  payload: {
    notification,
    nextAction
  }
});

// you're not supposed to call this directly, it's expected it will be called only from <NotificationContainer/>
export const dismissFullscreenAlertWithFollowup = alert => dispatch => {
  dispatch({
    type: FULLSCREEN_ALERT_WITH_FOLLOWUP_DISMISSED,
    payload: alert
  });

  dispatch(alert.nextAction);

  return null;
};

// notification is expected to be an instance of ../modules/helpers/NotificationHelper
// yesAction is the action to be dispatched is the user clicks 'Yes' on the modal. Optional
// noAction is the action to be dispatched is the user clicks 'Yes' on the modal. Optional
export const addConfirmationAlert = (notification, yesAction, noAction) => ({
  type: CONFIRMATION_ALERT_ADDED,
  payload: {
    notification,
    yesAction,
    noAction
  }
});
