import ConnectionHelper from '../connectivity/ConnectionHelper';
import GlobalSettingsHelper from '../helpers/GlobalSettingsHelper';
import {
  GLOBAL_SETTINGS_URL
} from '../connectivity/AmpApiConstants';

const GlobalSettingsSyncUpManager = {

  /**
   * Go to an EP, get the list of global settings and save it in a collection,
   * thats the only responsibility of this function.
   * @returns {Promise}
   */
  syncUpGlobalSettings() {
    console.log('syncUpGlobalSettings');
    return new Promise((resolve, reject) => {
      return ConnectionHelper.doGet({ url: GLOBAL_SETTINGS_URL }).then(
        (data) => GlobalSettingsHelper.saveGlobalSetting(data).then(resolve).catch(reject)
      ).catch(reject);
    });
  }

};

module.exports = GlobalSettingsSyncUpManager;
