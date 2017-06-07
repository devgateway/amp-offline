import {
  FULLSCREEN_ALERT_ADDED,
  FULLSCREEN_ALERT_DISMISSED,
  FULLSCREEN_ALERT_WITH_FOLLOWUP_ADDED,
  FULLSCREEN_ALERT_WITH_FOLLOWUP_DISMISSED,
  CONFIRMATION_ALERT_ADDED,
  CONFIRMATION_ALERT_DISMISSED,
  MESSAGE_ADDED,
  MESSAGE_DISMISSED
} from '../actions/NotificationAction';

const initialState = {
  fullscreenAlerts: [],
  fullscreenAlertsWithFollowup: [],
  confirmationAlerts: [],
  messages: []
};

// curryable function for non equality
const notEqual = a => b => a !== b;

export default (state = initialState, action) => {
  switch (action.type) {
    case FULLSCREEN_ALERT_ADDED: {
      const newState = Object.assign({}, state);
      newState.fullscreenAlerts = state.fullscreenAlerts.concat(action.payload);
      return newState;
    }

    case FULLSCREEN_ALERT_DISMISSED: {
      const newState = Object.assign({}, state);
      newState.fullscreenAlerts = state.fullscreenAlerts.filter(notEqual(action.payload));
      return newState;
    }

    case FULLSCREEN_ALERT_WITH_FOLLOWUP_ADDED: {
      const newState = Object.assign({}, state);
      newState.fullscreenAlertsWithFollowup = state.fullscreenAlertsWithFollowup.concat(action.payload);
      return newState;
    }

    case FULLSCREEN_ALERT_WITH_FOLLOWUP_DISMISSED: {
      const newState = Object.assign({}, state);
      newState.fullscreenAlertsWithFollowup = state.fullscreenAlertsWithFollowup.filter(notEqual(action.payload));
      return newState;
    }

    case CONFIRMATION_ALERT_ADDED: {
      const newState = Object.assign({}, state);
      newState.confirmationAlerts = state.confirmationAlerts.concat(action.payload);
      return newState;
    }

    case CONFIRMATION_ALERT_DISMISSED: {
      const newState = Object.assign({}, state);
      newState.confirmationAlerts = state.confirmationAlerts.filter(notEqual(action.payload));
      return newState;
    }

    case MESSAGE_ADDED: {
      const newState = Object.assign({}, state);
      newState.messages = state.messages.concat(action.payload);
      return newState;
    }

    case MESSAGE_DISMISSED: {
      const newState = Object.assign({}, state);
      newState.messages = state.messages.filter(notEqual(action.payload));
      return newState;
    }

    default:
      return state;
  }
};
