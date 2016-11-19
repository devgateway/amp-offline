// @flow
import {STATE_LOGIN, STATE_LOGOUT} from '../actions/login';

export default function login(state: something = '', action: Object) {
  console.log('reducers/login.js');
  switch (action.type) {
    case STATE_LOGIN:
      return Object.assign({}, state, {
        loggedUser: action.actionData,
        loggedIn: true
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
