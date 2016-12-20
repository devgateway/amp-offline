// @flow
import urlUtils from '../utils/URLUtils'
import WorkspaceManager from '../modules/workspace/WorkspaceManager'

export const STATE_SELECT_WORKSPACE = 'STATE_SELECT_WORKSPACE';
export const STATE_GET_REMOTE_WORKSPACES_OK = 'STATE_GET_REMOTE_WORKSPACES_OK';
export const STATE_GET_REMOTE_WORKSPACES_FAIL = 'STATE_GET_REMOTE_WORKSPACES_FAIL';
export const STATE_WORKSPACE_PROCESSING = 'STATE_WORKSPACE_PROCESSING';

export function selectWorkspace(data) {
  return {
    type: STATE_SELECT_WORKSPACE,
    actionData: data
  };
}

export function getRemoteWorkspaces(token) {
  return (dispatch) => {
    console.log('getRemoteWorkspaces');

    WorkspaceManager.getWorkspacesFromStore().then(function (data) {
      dispatch(remoteCallCompleteOk(data));
    }).catch(function (err) {
      dispatch(remoteCallCompleteFail(err));
    });
    dispatch(sendingRequest());
  }
}

export function remoteCallCompleteOk(data) {
  console.log('remoteCallCompleteOk');
  return {
    type: STATE_GET_REMOTE_WORKSPACES_OK,
    actionData: data
  }
}

export function remoteCallCompleteFail(err) {
  console.log('remoteCallCompleteFail');
  return {
    type: STATE_GET_REMOTE_WORKSPACES_FAIL,
    actionData: err
  }
}

export function sendingRequest() {
  console.log('sendingRequest');
  return {
    type: STATE_WORKSPACE_PROCESSING
  }
}
