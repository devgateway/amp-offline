import ConnectionHelper from '../../connectivity/ConnectionHelper';
import { GET_WORKSPACES_URL } from '../../connectivity/AmpApiConstants';
import WorkspaceHelper from '../../helpers/WorkspaceHelper';
import AbstractAtomicSyncUpManager from './AbstractAtomicSyncUpManager';
import { SYNCUP_TYPE_WORKSPACES } from '../../../utils/Constants';
import Logger from '../../util/LoggerManager';

const logger = new Logger('Workspace syncup manager');

/* eslint-disable class-methods-use-this */

export default class WorkspaceSyncUpManager extends AbstractAtomicSyncUpManager {

  constructor() {
    super(SYNCUP_TYPE_WORKSPACES);
  }

  doAtomicSyncUp() {
    logger.log('syncUpWorkspaces');
    // The userSync we can modify this call to only retrieve
    return ConnectionHelper.doGet({
      url: GET_WORKSPACES_URL,
      paramsMap: { management: false, private: false },
      shouldRetry: true
    }).then((data) => WorkspaceHelper.replaceWorkspaces(data));
  }
}
