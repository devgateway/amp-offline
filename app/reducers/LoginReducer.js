import { STATE_LOGIN_OK, STATE_LOGIN_FAIL, STATE_LOGOUT, STATE_LOGIN_PROCESSING } from '../actions/LoginAction';
import LoggerManager from '../modules/util/LoggerManager';

const defaultState = {
  loggedIn: false,
  loginProcessing: false,
  errorMessage: ''
};

/**
 * This reducer saves info related to the login process only.
 * @param state
 * @param action
 * @returns {*}
 */
export default function loginReducer(state: Object = defaultState, action: Object) {
  LoggerManager.log('LoginReducer');
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
    case STATE_LOGOUT:
      return defaultState;
    case STATE_LOGIN_PROCESSING:
      return Object.assign({}, state, {
        loginProcessing: true
      });
    default:
      return state;
  }
}
