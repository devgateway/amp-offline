/* eslint-disable class-methods-use-this */
import { Constants } from 'amp-ui';
import ConnectionHelper from '../../connectivity/ConnectionHelper';
import { GET_WORKSPACES_URL } from '../../connectivity/AmpApiConstants';
import WorkspaceHelper from '../../helpers/WorkspaceHelper';
import AbstractAtomicSyncUpManager from './AbstractAtomicSyncUpManager';
import Logger from '../../util/LoggerManager';

const logger = new Logger('Workspace syncup manager');

/**
 * Workspace Sync Up Manager
 */
export default class WorkspaceSyncUpManager extends AbstractAtomicSyncUpManager {

  constructor() {
    super(Constants.SYNCUP_TYPE_WORKSPACES);
  }

  doAtomicSyncUp() {
    logger.log('syncUpWorkspaces');
    return ConnectionHelper.doGet({
      url: GET_WORKSPACES_URL,
      paramsMap: { management: false, private: true },
      shouldRetry: true
    }).then((data) => WorkspaceHelper.replaceWorkspaces(data));
  }
}
