import {
  FULLSCREEN_ALERT_ADDED,
  FULLSCREEN_ALERT_DISMISSED
} from '../actions/NotificationAction';

const initialState = {
  fullscreenAlerts: []
};

// curried function for non equality
const notEqual = a => b => a !== b;

export default (state = initialState, action) => {
  switch (action.type) {
    case FULLSCREEN_ALERT_ADDED: {
      const newState = Object.assign({}, state);
      newState.fullscreenAlerts = state.fullscreenAlerts.concat(action.notification);
      return newState;
    }

    case FULLSCREEN_ALERT_DISMISSED: {
      const newState = Object.assign({}, state);
      newState.fullscreenAlerts = state.fullscreenAlerts.filter(notEqual(action.notification));
      return newState;
    }

    default:
      return state;
  }
};
