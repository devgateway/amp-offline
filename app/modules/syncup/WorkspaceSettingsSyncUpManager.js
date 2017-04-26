import ConnectionHelper from '../connectivity/ConnectionHelper';
import {
  WORKSPACE_SETTINGS_URL
} from '../connectivity/AmpApiConstants';
import WSSettingsHelper from '../helpers/WSSettingsHelper';
import LoggerManager from '../../modules/util/LoggerManager';

const WorkspaceSettingsSyncUpManager = {

  syncUpWorkspaceSettings() {
    LoggerManager.log('syncUpWorkspaceSettings');
    return ConnectionHelper.doGet({ url: WORKSPACE_SETTINGS_URL })
      .then((data) => WSSettingsHelper.replaceAllWSSettings(data));
  }
};

module.exports = WorkspaceSettingsSyncUpManager;
