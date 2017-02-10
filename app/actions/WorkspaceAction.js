import WorkspaceManager from "../modules/workspace/WorkspaceManager";
import TeamMemberHelper from "../modules/helpers/TeamMemberHelper";
import {forwardTo} from '../utils/URLUtils'

export const STATE_SELECT_WORKSPACE = 'STATE_SELECT_WORKSPACE';
export const STATE_CONFIGURING_WORKSPACE_FILTER = 'STATE_CONFIGURING_WORKSPACE_FILTER';
export const STATE_CONFIGURED_WORKSPACE_FILTER = 'STATE_CONFIGURED_WORKSPACE_FILTER';

export const STATE_DESKTOP_LOADING = 'STATE_DESKTOP_LOADING';
export const STATE_DESKTOP_LOADED = 'STATE_DESKTOP_LOADED';
export const STATE_DESKTOP_ERROR = 'STATE_DESKTOP_LOADED';

// TODO: THIS must be properly integrated through AMPOFFLINE-147
export function selectWorkspace(wsId) {
  return (dispatch, ownProps) => {
    //with data we load ws
    WorkspaceManager.findWorkspaceById(wsId).then((data) => {
      const actionData = {
        teamMember: undefined,
        workspace: data
      };
      // TODO: remove, is temporary for dev testing until we have proper team members definitions
      dispatch({ type: STATE_SELECT_WORKSPACE, actionData });
      forwardTo('/desktop');
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
    }).catch(errorFetchingWorkspace=>{
      console.log(errorFetchingWorkspace);
      throw errorFetchingWorkspace;
    });

  }
}
export function loadWorkspaces() {
  return (dispatch, ownProps) => {
    dispatch({ type: STATE_DESKTOP_LOADING });
    const userId = {};
    // TODO extract user id
    WorkspaceManager.findAllWorkspacesForUser(userId).then((workspaces) => {
      //dispatch sucess on load action
      //this.props.workspace.workspaceList
      dispatch({ type: STATE_DESKTOP_LOADED, actionData: workspaces });
    }).catch((error) => {
      //dispatch sucess on error load
      dispatch({ type: STATE_DESKTOP_ERROR, actionData: workspaces });
      console.log("ocurrio un error");
      console.log(error);
    });
  }
}

