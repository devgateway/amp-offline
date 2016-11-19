// @flow
import {STATE_LOGIN_OK, STATE_LOGIN_FAIL, STATE_LOGOUT} from '../actions/login';

export default function login(state: something = '', action: Object) {
  console.log('reducers/login.js');
  switch (action.type) {
    case STATE_LOGIN_OK:
      return Object.assign({}, state, {
        loggedUser: action.actionData,
        loggedIn: true
      });
    case STATE_LOGIN_FAIL:
      return Object.assign({}, state, {
        loggedUser: undefined,
        loggedIn: false
      });
    case STATE_LOGOUT:
      return Object.assign({}, state, {
        loggedUser: undefined,
        loggedIn: false
      });
    default:
      console.log('default state: ' + action.type);
      return state;
  }
}
