import {
  STATE_SELECT_WORKSPACE,
  STATE_DESKTOP_LOADING,
  STATE_DESKTOP_LOADED,
  STATE_DESKTOP_ERROR,
  STATE_CONFIGURING_WORKSPACE_FILTER,
  STATE_CONFIGURED_WORKSPACE_FILTER
} from '../actions/WorkspaceAction';

const defaultState = {
  workspaceLoading: false,
  workspaceList: [],
  workspaceFilterGeneration: false,
  workspaceFilter: undefined
};

export default function workspace(state = defaultState, action: Object) {
  console.log('WorkspaceReducer');
  switch (action.type) {
    case STATE_DESKTOP_LOADED:
      return Object.assign({}, state, {
        workspaceLoading: false,
        workspaceList: action.actionData
      });
    case STATE_DESKTOP_ERROR:
      return Object.assign({}, state, {
        workspaceLoading: false,
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
    case STATE_DESKTOP_LOADING:
      return Object.assign({}, state, {
        workspaceLoading: true,
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
