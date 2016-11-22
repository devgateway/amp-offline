// @flow
import {STATE_SELECT_WORKSPACE, STATE_GET_REMOTE_WORKSPACES, STATE_WORKSPACE_PROCESSING} from '../actions/workspace';

const defaultState = {
  workspaceProcessing: false,
  workspaceList: []
};

export default function login(state: something = defaultState, action: Object) {
  console.log('reducers/workspace.js');
  switch (action.type) {
    case STATE_GET_REMOTE_WORKSPACES:
      return Object.assign({}, state, {
        workspaceProcessing: false,
        workspaceList: action.workspaceList
      });
    case STATE_SELECT_WORKSPACE:
      return Object.assign({}, state, {
        workspaceProcessing: false,
        currentWorkspace: action.selectedWorkspaceId
      });
    case STATE_WORKSPACE_PROCESSING:
      return Object.assign({}, state, {
        workspaceProcessing: true,
        workspaceList: [],
        currentWorkspace: undefined
      });
    default:
      console.log('default state: ' + action.type);
      return state;
  }
}
