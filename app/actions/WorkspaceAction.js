import WorkspaceManager from '../modules/workspace/WorkspaceManager';
import { loadDesktop } from './DesktopAction';
import TeamMemberHelper from '../modules/helpers/TeamMemberHelper';
import WorkspaceHelper from '../modules/helpers/WorkspaceHelper';
import store from '../index';
import LoggerManager from '../modules/util/LoggerManager';

export const STATE_SELECT_WORKSPACE = 'STATE_SELECT_WORKSPACE';
export const STATE_CONFIGURING_WORKSPACE_FILTER = 'STATE_CONFIGURING_WORKSPACE_FILTER';
export const STATE_CONFIGURED_WORKSPACE_FILTER = 'STATE_CONFIGURED_WORKSPACE_FILTER';

export const STATE_WORKSPACE_LOADING = 'STATE_WORKSPACE_LOADING';
export const STATE_WORKSPACE_LOADED = 'STATE_WORKSPACE_LOADED';
export const STATE_WORKSPACE_ERROR = 'STATE_WORKSPACE_ERROR';

// TODO: THIS must be properly integrated through AMPOFFLINE-147
export function selectWorkspace(wsId) {
  LoggerManager.log('selectWorkspace');
  // We dont get userId as param because that messes up the onClickHandler used also in main menu.
  const userId = store.getState().userReducer.userData.id;
  return (dispatch) => (
    WorkspaceHelper.findById(wsId).then((workspace) => (
      TeamMemberHelper.findByUserAndWorkspaceId(userId, wsId).then((teamMember) => {
        const actionData = { teamMember, workspace };
        dispatch({ type: STATE_SELECT_WORKSPACE, actionData });
        // This is like "chaining actions".
        return dispatch(loadDesktop(workspace, teamMember.id));
      }).catch((err) => {
        LoggerManager.error(err);
        dispatch({ type: STATE_WORKSPACE_ERROR, actionData: err.toString() });
      })
    ))
  );
}

export function loadWorkspaces(userId) {
  LoggerManager.log('loadWorkspaces');
  return (dispatch) => {
    dispatch({ type: STATE_WORKSPACE_LOADING });
    return WorkspaceManager.findAllWorkspacesForUser(userId).then((workspaces) => (
      dispatch({ type: STATE_WORKSPACE_LOADED, actionData: workspaces })
    )).catch((err) => {
      LoggerManager.error(err);
      return dispatch({ type: STATE_WORKSPACE_ERROR, actionData: err });
    });
  };
}
