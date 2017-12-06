import {
  STATE_CONFIGURED_WORKSPACE_FILTER,
  STATE_CONFIGURING_WORKSPACE_FILTER,
  STATE_SELECT_WORKSPACE,
  STATE_SELECT_WORKSPACE_ERROR,
  STATE_WORKSPACE_LOAD_DENIED,
  STATE_WORKSPACES_ERROR,
  STATE_WORKSPACES_LOADED,
  STATE_WORKSPACES_LOADING
} from '../actions/WorkspaceAction';
import Logger from '../modules/util/LoggerManager';

const logger = new Logger('Workspace reducer');

const defaultState = {
  currentWorkspace: undefined,
  workspacesLoading: false,
  workspaceList: [],
  workspaceFilterGeneration: false,
  workspaceFilter: undefined
};

export default function workspaceReducer(state = defaultState, action: Object) {
  logger.debug('WorkspaceReducer');
  switch (action.type) {
    case STATE_WORKSPACES_LOADING:
      return Object.assign({}, state, {
        workspacesLoading: true,
        workspaceList: []
      });
    case STATE_WORKSPACES_LOADED:
      return Object.assign({}, state, {
        workspacesLoading: false,
        workspaceList: action.actionData
      });
    case STATE_WORKSPACES_ERROR:
      return Object.assign({}, state, {
        workspacesLoading: false,
        workspaceList: [],
        errorMessage: action.actionData
      });
    case STATE_WORKSPACE_LOAD_DENIED: {
      return Object.assign({}, state, {
        workspacesLoading: false
      });
    }
    case STATE_SELECT_WORKSPACE:
      return Object.assign({}, state, {
        workspaceProcessing: false,
        currentWorkspace: action.actionData.workspace,
        currentWorkspaceSettings: action.actionData.workspaceSettings,
        workspaceFilterGeneration: false,
        workspaceFilter: undefined
      });
    case STATE_SELECT_WORKSPACE_ERROR:
      return { ...state,
        workspaceProcessing: false,
        currentWorkspace: undefined,
        workspaceFilter: undefined,
        errorMessage: action.actionData
      };
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
      logger.debug(`default state: ${action.type}`);
      return state;
  }
}
