import {
  FULLSCREEN_ALERT_ADDED
} from '../actions/NotificationAction';

const initialState = {
  fullscreenAlerts: []
};

export default (state = initialState, action) => {
  switch (action.type) {
    case FULLSCREEN_ALERT_ADDED: {
      const newState = Object.assign({}, state);
      newState.fullscreenAlerts = state.fullscreenAlerts.concat(action.notification);
      return newState;
    }
    default:
      return state;
  }
};
