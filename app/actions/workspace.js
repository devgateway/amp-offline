// @flow
import urlUtils from '../utils/urlUtils'
import WorkspaceManager from '../modules/workspace/WorkspaceManager'

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
  return (dispatch) => {
    console.log('getRemoteWorkspaces');
    WorkspaceManager.getWorkspacesFromRemote('', (success, data) => {
      dispatch(remoteCallComplete(success, data)); //TODO: Handle errors.
    });
    dispatch(sendingRequest());
  }
}

export function remoteCallComplete(result, data) {
  console.log('remoteCallComplete');
  return {
    type: STATE_GET_REMOTE_WORKSPACES,
    actionData: data
  }
}

export function sendingRequest() {
  console.log('sendingRequest');
  return {
    type: STATE_WORKSPACE_PROCESSING
  }
}
