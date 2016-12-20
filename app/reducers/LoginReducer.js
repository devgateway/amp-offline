// @flow
import {STATE_LOGIN_OK, STATE_LOGIN_FAIL, STATE_LOGOUT, STATE_LOGIN_PROCESSING} from '../actions/LoginAction';

const defaultState = {
  loggedUser: undefined,
  loggedIn: false,
  loginProcessing: false,
  errorMessage: ''
};

export default function login(state = defaultState, action: Object) {
  console.log('LoginReducer');
  switch (action.type) {
    case STATE_LOGIN_OK:
      return Object.assign({}, state, {
        loggedUser: action.actionData,
        loggedIn: true,
        loginProcessing: false
      });
    case STATE_LOGIN_FAIL:
      return Object.assign({}, state, {
        loggedUser: undefined,
        loggedIn: false,
        loginProcessing: false,
        errorMessage: action.actionData.errorMessage
      });
    case STATE_LOGOUT:
      return Object.assign({}, state, {
        loggedUser: undefined,
        loggedIn: false,
        loginProcessing: false
      });
    case STATE_LOGIN_PROCESSING:
      return Object.assign({}, state, {
        loginProcessing: true,
        errorMessage: ''
      });
    default:
      console.log('default state: ' + action.type);
      return state;
  }
}
