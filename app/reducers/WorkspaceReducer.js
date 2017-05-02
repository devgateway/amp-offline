import {
  STATE_SELECT_WORKSPACE,
  STATE_WORKSPACE_LOADING,
  STATE_WORKSPACE_LOADED,
  STATE_WORKSPACE_ERROR,
  STATE_CONFIGURING_WORKSPACE_FILTER,
  STATE_CONFIGURED_WORKSPACE_FILTER
} from '../actions/WorkspaceAction';
import LoggerManager from '../modules/util/LoggerManager';

const defaultState = {
  workspaceLoading: false,
  workspaceList: [],
  workspaceFilterGeneration: false,
  workspaceFilter: undefined
};

export default function workspaceReducer(state = defaultState, action: Object) {
  LoggerManager.log('WorkspaceReducer');
  switch (action.type) {
    case STATE_WORKSPACE_LOADED:
      return Object.assign({}, state, {
        workspaceLoading: false,
        workspaceList: action.actionData
      });
    case STATE_WORKSPACE_ERROR:
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
    case STATE_WORKSPACE_LOADING:
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
      LoggerManager.log(`default state: ${action.type}`);
      return state;
  }
}
