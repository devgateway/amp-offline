import {
  FULLSCREEN_ALERT_ADDED,
  FULLSCREEN_ALERT_DISMISSED,
  FULLSCREEN_ALERT_WITH_FOLLOWUP_ADDED,
  FULLSCREEN_ALERT_WITH_FOLLOWUP_DISMISSED,
} from '../actions/NotificationAction';

const initialState = {
  fullscreenAlerts: [],
  fullscreenAlertsWithFollowup: []
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

    default:
      return state;
  }
};
