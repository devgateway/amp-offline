import WorkspaceManager from '../modules/workspace/WorkspaceManager';
import { loadDesktop } from './DesktopAction';

export const STATE_SELECT_WORKSPACE = 'STATE_SELECT_WORKSPACE';
export const STATE_CONFIGURING_WORKSPACE_FILTER = 'STATE_CONFIGURING_WORKSPACE_FILTER';
export const STATE_CONFIGURED_WORKSPACE_FILTER = 'STATE_CONFIGURED_WORKSPACE_FILTER';

export const STATE_WORKSPACE_LOADING = 'STATE_WORKSPACE_LOADING';
export const STATE_WORKSPACE_LOADED = 'STATE_WORKSPACE_LOADED';
export const STATE_WORKSPACE_ERROR = 'STATE_WORKSPACE_ERROR';

// TODO: THIS must be properly integrated through AMPOFFLINE-147
export function selectWorkspace(wsId) {
  return (dispatch) => {
    // With data we load ws.
    WorkspaceManager.findWorkspaceById(wsId).then((data) => {
      const actionData = {
        teamMember: undefined,
        workspace: data
      };
      // TODO: remove, is temporary for dev testing until we have proper team members definitions
      dispatch({ type: STATE_SELECT_WORKSPACE, actionData });
      /* Commenting until team member sync is resolved
       TeamMemberHelper.findByUserAndWorkspaceId(ownProps().user.userData.id, data.id).then(
       (teamMember) => {
       actionData.teamMember = teamMember;
       actionData.teamMember.workspace = data;
       dispatch({ type: STATE_SELECT_WORKSPACE, actionData });
       return resolve(actionData);
       })
       .then((actionData) => {
       dispatch({ type: STATE_CONFIGURING_WORKSPACE_FILTER });
       return WorkspaceManager.getWorkspaceFilter().then(wsFilter => {
       dispatch({ type: STATE_CONFIGURED_WORKSPACE_FILTER, actionData: wsFilter });
       return wsFilter;
       });
       })
       .catch(error => {
       console.log(error);
       throw error;
       });
       */

      // This is like "chaining actions".
      return dispatch(loadDesktop(wsId));
    }).catch(errorFetchingWorkspace => {
      console.log(errorFetchingWorkspace);
      throw errorFetchingWorkspace;
    });
  };
}
export function loadWorkspaces() {
  return (dispatch) => {
    dispatch({ type: STATE_WORKSPACE_LOADING });
    const userId = {};
    // TODO extract user id
    WorkspaceManager.findAllWorkspacesForUser(userId).then((workspaces) => (
      // dispatch sucess on load action
      // this.props.workspace.workspaceList
      dispatch({ type: STATE_WORKSPACE_LOADED, actionData: workspaces })
    )).catch((error) => {
      console.log(error);
      // dispatch sucess on error load
      return dispatch({ type: STATE_WORKSPACE_ERROR, actionData: error });
    });
  };
}

