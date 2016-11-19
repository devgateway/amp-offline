// @flow
import {STATE_LOGIN_OK, STATE_LOGIN_FAIL, STATE_LOGOUT, STATE_LOGIN_PROCESSING} from '../actions/login';

export default function login(state: something = '', action: Object) {
  console.log('reducers/login.js');
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
        loginProcessing: false
      });
    case STATE_LOGOUT:
      return Object.assign({}, state, {
        loggedUser: undefined,
        loggedIn: false,
        loginProcessing: false
      });
    case STATE_LOGIN_PROCESSING:
      return Object.assign({}, state, {
        loginProcessing: true
      });
    default:
      console.log('default state: ' + action.type);
      return state;
  }
}
