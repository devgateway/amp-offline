import ConnectionHelper from '../../connectivity/ConnectionHelper';
import GlobalSettingsHelper from '../../helpers/GlobalSettingsHelper';
import AbstractAtomicSyncUpManager from './AbstractAtomicSyncUpManager';
import { GLOBAL_SETTINGS_URL } from '../../connectivity/AmpApiConstants';
import { SYNCUP_TYPE_GS } from '../../../utils/Constants';
import Logger from '../../util/LoggerManager';

const logger = new Logger('Global settings syncup manager');

/* eslint-disable class-methods-use-this */

export default class GlobalSettingsSyncUpManager extends AbstractAtomicSyncUpManager {
  constructor() {
    super(SYNCUP_TYPE_GS);
  }

  /**
   * Go to an EP, get the list of global settings and save it in a collection,
   * thats the only responsibility of this function.
   * @returns {Promise}
   */
  doAtomicSyncUp() {
    logger.log('syncUpGlobalSettings');
    return new Promise((resolve, reject) => (
      ConnectionHelper.doGet({ url: GLOBAL_SETTINGS_URL, shouldRetry: true }).then(
        (data) => GlobalSettingsHelper.saveGlobalSettings(data).then(resolve).catch(reject)
      ).catch(reject)
    ));
  }

}
