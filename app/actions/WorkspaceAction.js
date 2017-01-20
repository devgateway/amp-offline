// TODO: this is temporary to move on and final binding to the store will be done through AMPOFFLINE-103
import { store } from '../index.js';

import WorkspaceManager from '../modules/workspace/WorkspaceManager';
import TeamMemberHelper from '../modules/helpers/TeamMemberHelper';

export const STATE_SELECT_WORKSPACE = 'STATE_SELECT_WORKSPACE';
export const STATE_GET_REMOTE_WORKSPACES_OK = 'STATE_GET_REMOTE_WORKSPACES_OK';
export const STATE_GET_REMOTE_WORKSPACES_FAIL = 'STATE_GET_REMOTE_WORKSPACES_FAIL';
export const STATE_WORKSPACE_PROCESSING = 'STATE_WORKSPACE_PROCESSING';
export const STATE_CONFIGURING_WORKSPACE_FILTER = 'STATE_CONFIGURING_WORKSPACE_FILTER';
export const STATE_CONFIGURED_WORKSPACE_FILTER = 'STATE_CONFIGURED_WORKSPACE_FILTER';

export function selectWorkspace(data) {
  const actionData = {
    teamMember: undefined,
    workspace: data
  };
  // TODO: remove, is only for testing
  store.dispatch({ type: STATE_SELECT_WORKSPACE, actionData });
  TeamMemberHelper.findByUserAndWorkspaceId(this.context.store.getState().user.userData.id, data.id).then(
    (teamMember) => {
      actionData.teamMember = teamMember;
      actionData.teamMember.workspace = data;
      dispatch({ type: STATE_SELECT_WORKSPACE, actionData });
      dispatch({ type: STATE_CONFIGURING_WORKSPACE_FILTER });
      WorkspaceManager.getWorkspaceFilter().then(wsFilter => dispatch({
        type: STATE_CONFIGURED_WORKSPACE_FILTER,
        actionData: wsFilter
      })).catch(error => {
        throw error;
      });
      return actionData;
    }).catch(error => {
      console.log(error);
    });
}

