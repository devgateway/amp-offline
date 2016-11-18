// @flow
import {STATE_LOGIN, STATE_LOGOUT} from '../actions/login';

export default function login(state: something = 0, action: Object) {
  console.log(state);
  console.log(action);
  switch (action.type) {
    case STATE_LOGIN:
      return Object.assign({}, state, () => {
        loggedUser: action.response;
      });
    case STATE_LOGOUT:
      return Object.assign({}, state, () => {
        loggedUser: undefined;
      });
    default:
      return state;
  }
}
