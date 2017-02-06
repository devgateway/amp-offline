import WorkspaceManager from '../modules/workspace/WorkspaceManager';
import TeamMemberHelper from '../modules/helpers/TeamMemberHelper';

export const STATE_SELECT_WORKSPACE = 'STATE_SELECT_WORKSPACE';
export const STATE_CONFIGURING_WORKSPACE_FILTER = 'STATE_CONFIGURING_WORKSPACE_FILTER';
export const STATE_CONFIGURED_WORKSPACE_FILTER = 'STATE_CONFIGURED_WORKSPACE_FILTER';

// TODO: THIS must be properly integrated through AMPOFFLINE-147
export function selectWorkspace(data) {
  const actionData = {
    teamMember: undefined,
    workspace: data
  };
  // TODO: remove, is temporary for dev testing until we have proper team members definitions
  store.dispatch({ type: STATE_SELECT_WORKSPACE, actionData });
  TeamMemberHelper.findByUserAndWorkspaceId(this.context.store.getState().user.userData.id, data.id).then(
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
}

