// @flow
export const STATE_SELECT_WORKSPACE = 'STATE_SELECT_WORKSPACE';
export const STATE_GET_REMOTE_WORKSPACES = 'STATE_GET_REMOTE_WORKSPACES';
export const STATE_WORKSPACE_PROCESSING = 'STATE_WORKSPACE_PROCESSING';

export function selectWorkspace(data) {
  return {
    type: STATE_SELECT_WORKSPACE,
    actionData: data
  };
}

export function getRemoteWorkspaces() {
  return {
    type: STATE_GET_REMOTE_WORKSPACES
  }
}
