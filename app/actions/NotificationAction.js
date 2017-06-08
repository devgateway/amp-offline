/*
  Fullscreen alert = a message that covers all of the page preventing the user from interacting with the app until he
  dismisses it.

  We have 3 types of alerts:
  1. One that just informs the user of something, but after it's dismissed nothing happens(addFullscreenAlert)
  2. One that informs the user about something, but after it's dismissed another action is dispatched
     (addFullscreenAlertWithFollowup)
  3. One that asks user to accept or refuse something, it has 2 actions, one for 'yes' and one for 'no'
     (both are optional), that are dispatched depending on what the user chooses(addConfirmationAlert)

  Message = a timing out small notification that appears in the top-right corner of the screen, doesn't prevent
  the user from interacting with the app, can't have an attached action to be dispatched after(addMessage).
  Depending on Notification instance's severity the message will have different styles.
  See the component for more information.

  Related reducer: reducers/NotificationReducer
  Related components: components/notifications
 */

export const FULLSCREEN_ALERT_ADDED = 'FULLSCREEN_ALERT_ADDED';
export const FULLSCREEN_ALERT_DISMISSED = 'FULLSCREEN_ALERT_DISMISSED';
export const FULLSCREEN_ALERT_WITH_FOLLOWUP_ADDED = 'FULLSCREEN_ALERT_WITH_FOLLOWUP_ADDED';
export const FULLSCREEN_ALERT_WITH_FOLLOWUP_DISMISSED = 'FULLSCREEN_ALERT_WITH_FOLLOWUP_DISMISSED';
export const CONFIRMATION_ALERT_ADDED = 'CONFIRMATION_ALERT_ADDED';
export const CONFIRMATION_ALERT_DISMISSED = 'CONFIRMATION_ALERT_DISMISSED';
export const MESSAGE_ADDED = 'MESSAGE_ADDED';
export const MESSAGE_DISMISSED = 'MESSAGE_DISMISSED';

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

export const dismissConfirmationAlert = (alert, yesOrNo) => dispatch => {
  dispatch({
    type: CONFIRMATION_ALERT_DISMISSED,
    payload: alert
  });

  const { yesAction, noAction } = alert;

  if (yesOrNo && yesAction) {
    dispatch(yesAction);
  } else if (noAction) {
    dispatch(noAction);
  }
};

export const addMessage = notification => ({
  type: MESSAGE_ADDED,
  payload: notification
});

export const dismissMessage = notification => ({
  type: MESSAGE_DISMISSED,
  payload: notification
});
