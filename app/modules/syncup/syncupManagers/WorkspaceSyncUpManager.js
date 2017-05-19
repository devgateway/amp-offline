import ConnectionHelper from '../../connectivity/ConnectionHelper';
import { GET_WORKSPACES_URL } from '../../connectivity/AmpApiConstants';
import WorkspaceHelper from '../../helpers/WorkspaceHelper';
import AbstractAtomicSyncUpManager from './AbstractAtomicSyncUpManager';
import LoggerManager from '../../util/LoggerManager';

/* eslint-disable class-methods-use-this */

export default class WorkspaceSyncUpManager extends AbstractAtomicSyncUpManager {

  doAtomicSyncUp() {
    LoggerManager.log('syncUpWorkspaces');
    // The userSync we can modify this call to only retrieve
    return ConnectionHelper.doGet({ url: GET_WORKSPACES_URL, paramsMap: { management: false, private: false } })
      .then((data) => WorkspaceHelper.replaceWorkspaces(data));
  }
}