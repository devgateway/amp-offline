import {
  FULLSCREEN_ALERT_ADDED,
  FULLSCREEN_ALERT_DISMISSED,
  FULLSCREEN_ALERT_WITH_FOLLOWUP_ADDED
} from '../actions/NotificationAction';

const initialState = {
  fullscreenAlerts: [],
  fullscreenAlertsWithFollowup: []
};

export default (state = initialState, action) => {
  switch (action.type) {
    case FULLSCREEN_ALERT_ADDED: {
      const newState = Object.assign({}, state);
      newState.fullscreenAlerts = state.fullscreenAlerts.concat(action.notification);
      return newState;
    }

    case FULLSCREEN_ALERT_DISMISSED: {
      const newState = Object.assign({}, state);
      newState.fullscreenAlerts = state.fullscreenAlerts.filter(notification => notification !== action.notification);
      return newState;
    }

    case FULLSCREEN_ALERT_WITH_FOLLOWUP_ADDED: {
      const newState = Object.assign({}, state);
      newState.fullscreenAlertsWithFollowup = state.fullscreenAlertsWithFollowup.concat({
        notification: action.notification,
        callback: action.callback
      });
      return newState;
    }

    default:
      return state;
  }
};
