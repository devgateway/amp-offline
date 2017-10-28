import {
  STATE_LOGIN_FAIL,
  STATE_LOGIN_OK,
  STATE_LOGIN_PROCESSING,
  STATE_LOGOUT,
  STATE_LOGOUT_ASK_TO_SYNC,
  STATE_LOGOUT_DISMISS,
  STATE_LOGOUT_DISMISS_TO_SYNC,
  STATE_LOGOUT_REQUESTED,
  STATE_CHANGE_PASSWORD_ONLINE,
  STATE_RESET_PASSWORD_ONLINE
} from '../actions/LoginAction';
import Logger from '../modules/util/LoggerManager';

const logger = new Logger('Login reducer');

const defaultState = {
  loggedIn: false,
  loginProcessing: false,
  askToSync: false,
  logoutConfirmed: false,
  logoutDismissedToSync: false,
  isInactivityTimeout: false,
  errorMessage: ''
};

/**
 * This reducer saves info related to the login process only.
 * @param state
 * @param action
 * @returns {*}
 */
export default function loginReducer(state: Object = defaultState, action: Object) {
  logger.log('LoginReducer');
  switch (action.type) {
    case STATE_LOGIN_OK:
      return Object.assign({}, state, {
        loggedIn: true,
        plainPassword: action.actionData.password,
        loginProcessing: false
      });
    case STATE_LOGIN_FAIL:
      return Object.assign({}, state, {
        loggedIn: false,
        loginProcessing: false,
        errorMessage: action.actionData.errorMessage
      });
    case STATE_LOGOUT_ASK_TO_SYNC:
      return { ...state, askToSync: action.actionData.askToSync };
    case STATE_LOGOUT_DISMISS:
      return { ...state, logoutConfirmed: false, logoutDismissedToSync: false };
    case STATE_LOGOUT_DISMISS_TO_SYNC:
      return { ...state, logoutConfirmed: false, logoutDismissedToSync: true };
    case STATE_LOGOUT_REQUESTED:
      return {
        ...state,
        logoutConfirmed: action.actionData.logoutConfirmed,
        isInactivityTimeout: action.actionData.isInactivityTimeout
      };
    case STATE_LOGOUT:
      return {
        ...defaultState,
        logoutConfirmed: true,
        isInactivityTimeout: action.actionData && action.actionData.isInactivityTimeout
      };
    case STATE_LOGIN_PROCESSING:
      return Object.assign({}, state, {
        loginProcessing: true,
        logoutConfirmed: false,
        isInactivityTimeout: false
      });
    case STATE_CHANGE_PASSWORD_ONLINE:
      return Object.assign({}, state);
    case STATE_RESET_PASSWORD_ONLINE:
      return Object.assign({}, state);
    default:
      return state;
  }
}
