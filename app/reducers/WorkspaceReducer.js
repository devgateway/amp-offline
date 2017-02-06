import {
  STATE_SELECT_WORKSPACE,
  STATE_GET_REMOTE_WORKSPACES_OK,
  STATE_GET_REMOTE_WORKSPACES_FAIL,
  STATE_WORKSPACE_PROCESSING,
  STATE_CONFIGURING_WORKSPACE_FILTER,
  STATE_CONFIGURED_WORKSPACE_FILTER
} from '../actions/WorkspaceAction';

const defaultState = {
  workspaceProcessing: false,
  workspaceList: [],
  workspaceFilterGeneration: false,
  workspaceFilter: undefined
};

export default function workspace(state = defaultState, action: Object) {
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
        currentWorkspace: action.actionData.workspace,
        workspaceFilterGeneration: false,
        workspaceFilter: undefined
      });
    case STATE_WORKSPACE_PROCESSING:
      return Object.assign({}, state, {
        workspaceProcessing: true,
        workspaceList: [],
        currentWorkspace: undefined,
        workspaceFilterGeneration: false,
        workspaceFilter: undefined
      });
    case STATE_CONFIGURING_WORKSPACE_FILTER:
      return Object.assign({}, state, {
        workspaceFilterGeneration: true,
        workspaceFilter: undefined
      });
    case STATE_CONFIGURED_WORKSPACE_FILTER:
      return Object.assign({}, state, {
        workspaceFilterGeneration: false,
        workspaceFilter: action.actionData
      });
    default:
      console.log(`default state: ${action.type}`);
      return state;
  }
}
