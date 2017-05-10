import ConnectionHelper from '../../connectivity/ConnectionHelper';
import { WORKSPACE_SETTINGS_URL } from '../../connectivity/AmpApiConstants';
import WSSettingsHelper from '../../helpers/WSSettingsHelper';
import AbstractAtomicSyncUpManager from './AbstractAtomicSyncUpManager';
import LoggerManager from '../../util/LoggerManager';

/* eslint-disable class-methods-use-this */

export default class WorkspaceSettingsSyncUpManager extends AbstractAtomicSyncUpManager {

  doAtomicSyncUp() {
    LoggerManager.log('syncUpWorkspaceSettings');
    return ConnectionHelper.doGet({ url: WORKSPACE_SETTINGS_URL })
      .then((data) => WSSettingsHelper.replaceAllWSSettings(data));
  }
}
