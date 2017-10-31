import ConnectionHelper from '../../connectivity/ConnectionHelper';
import { WORKSPACE_SETTINGS_URL } from '../../connectivity/AmpApiConstants';
import WSSettingsHelper from '../../helpers/WSSettingsHelper';
import AbstractAtomicSyncUpManager from './AbstractAtomicSyncUpManager';
import { SYNCUP_TYPE_WORKSPACE_SETTINGS } from '../../../utils/Constants';
import Logger from '../../util/LoggerManager';
import WorkspaceHelper from '../../helpers/WorkspaceHelper';
import * as Utils from '../../../utils/Utils';

const logger = new Logger('Workspace settings syncup manager');

/* eslint-disable class-methods-use-this */

export default class WorkspaceSettingsSyncUpManager extends AbstractAtomicSyncUpManager {

  constructor() {
    super(SYNCUP_TYPE_WORKSPACE_SETTINGS);
  }

  doAtomicSyncUp() {
    logger.log('doAtomicSyncUp');
    return WorkspaceHelper.findAll({}).then(wsMap => {
      const paramsMap = { 'workspace-ids': Utils.flattenToListByKey(wsMap, 'id') };
      return ConnectionHelper.doGet({ url: WORKSPACE_SETTINGS_URL, paramsMap, shouldRetry: true })
        .then((data) => WSSettingsHelper.replaceAllWSSettings(data));
    });
  }
}
