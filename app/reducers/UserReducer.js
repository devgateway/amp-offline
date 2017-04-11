import { STATE_LOGIN_OK, STATE_LOGOUT } from '../actions/LoginAction';
import { STATE_SELECT_WORKSPACE } from '../actions/WorkspaceAction';
import LoggerManager from '../modules/util/LoggerManager';

export const STATE_USER_CLEAR = 'STATE_USER_CLEAR';

const defaultState = {
  userData: undefined,
  teamMember: undefined
};

/**
 * This reducer saves info about the current User only.
 * @param state
 * @param action
 * @returns {*}
 */
export default function user(state = defaultState, action: Object) {
  LoggerManager.log('UserReducer');
  switch (action.type) {
    case STATE_LOGIN_OK:
      return Object.assign({}, state, {
        userData: action.actionData.userData,
        teamMember: undefined
      });
    case STATE_SELECT_WORKSPACE:
      return Object.assign({}, state, {
        teamMember: action.actionData.teamMember
      });
    case STATE_LOGOUT:
      return defaultState;
    case STATE_USER_CLEAR:
      return Object.assign({}, state, defaultState);
    default:
      return state;
  }
}
