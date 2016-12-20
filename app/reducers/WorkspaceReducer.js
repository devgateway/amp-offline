// @flow
import {
  STATE_SELECT_WORKSPACE,
  STATE_GET_REMOTE_WORKSPACES_OK,
  STATE_GET_REMOTE_WORKSPACES_FAIL,
  STATE_WORKSPACE_PROCESSING
} from '../actions/WorkspaceAction';

const defaultState = {
  workspaceProcessing: false,
  workspaceList: []
};

export default function workspaceReducer(state: something = defaultState, action: Object) {
  console.log('WorkspaceReducer');
  switch (action.type) {
    case STATE_GET_REMOTE_WORKSPACES_OK:
      return Object.assign({}, state, {
        workspaceProcessing: false,
        workspaceList: action.actionData
      });
    case STATE_GET_REMOTE_WORKSPACES_FAIL:
      return Object.assign({}, state, {
        workspaceProcessing: false,
        workspaceList: [],
        errorMessage: action.actionData
      });
    case STATE_SELECT_WORKSPACE:
      return Object.assign({}, state, {
        workspaceProcessing: false,
        currentWorkspace: action.workspace
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
