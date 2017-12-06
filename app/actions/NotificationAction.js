/*
  Fullscreen alert = a message that covers all of the page preventing the user from interacting with the app until he
  dismisses it.

  We have 3 types of alerts:
  1. One that just informs the user of something, but after it's dismissed nothing happens(addFullscreenAlert)
  2. One that informs the user about something, but after it's dismissed another action is dispatched
     (addFullscreenAlertWithFollowup)
  3. One that asks user to accept or refuse something, it allows multiple actions, e.g. one for 'yes' and one for 'no'
     (all are optional), that are dispatched depending on what the user chooses(addConfirmationAlert)

  All alerts are `first came first served`, meaning if there's more of them they'll be displayed chronologically.
  Alerts are prioritized in this way: fullscreen alert with no follup > fullscreen alerts with followup > confirmations,
  meaning that if we have multiple alerts of every time, first the user will have to go through all the alerts with no
  followup, then through alerts with followup and only finally through confirmation alerts.

  Message = a timing out small notification that appears in the top-right corner of the screen, doesn't prevent
  the user from interacting with the app, can't have an attached action to be dispatched after(addMessage).
  Depending on Notification instance's severity the message will have different styles.
  See the component for more information.

  Related reducer: reducers/NotificationReducer
  Related components: components/notifications
 */

import ConfirmationAlert from '../components/notifications/confirmationAlert';

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

// confirmationAlert is expected to be an instance of ../components/notifications/confirmationAlert
export const addConfirmationAlert = (confirmationAlert: ConfirmationAlert) => ({
  type: CONFIRMATION_ALERT_ADDED,
  payload: confirmationAlert
});

export const dismissConfirmationAlert = (alert, action) => dispatch => {
  dispatch({
    type: CONFIRMATION_ALERT_DISMISSED,
    payload: alert
  });

  if (action) {
    dispatch(action);
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
