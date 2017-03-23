import ConnectionHelper from '../connectivity/ConnectionHelper';
import {
  GET_WORKSPACES_URL
} from '../connectivity/AmpApiConstants';
import WorkspaceHelper from '../helpers/WorkspaceHelper';

const WorkspaceSyncUpManager = {

  syncUpWorkspaces() {
    console.log('syncUpWorkspaces');
    // The userSync we can modify this call to only retrieve
    return ConnectionHelper.doGet({ url: GET_WORKSPACES_URL, paramsMap: { management: false, private: false } })
      .then((data) => WorkspaceHelper.replaceWorkspaces(data));
  }
};

module.exports = WorkspaceSyncUpManager;
