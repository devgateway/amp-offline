import ConnectionHelper from '../../connectivity/ConnectionHelper';
import GlobalSettingsHelper from '../../helpers/GlobalSettingsHelper';
import AbstractAtomicSyncUpManager from './AbstractAtomicSyncUpManager';
import { GLOBAL_SETTINGS_URL } from '../../connectivity/AmpApiConstants';
import LoggerManager from '../../util/LoggerManager';

/* eslint-disable class-methods-use-this */

export default class GlobalSettingsSyncUpManager extends AbstractAtomicSyncUpManager {

  /**
   * Go to an EP, get the list of global settings and save it in a collection,
   * thats the only responsibility of this function.
   * @returns {Promise}
   */
  doAtomicSyncUp() {
    LoggerManager.log('syncUpGlobalSettings');
    return new Promise((resolve, reject) => (
      ConnectionHelper.doGet({ url: GLOBAL_SETTINGS_URL }).then(
        (data) => GlobalSettingsHelper.saveGlobalSettings(data).then(resolve).catch(reject)
      ).catch(reject)
    ));
  }

}
