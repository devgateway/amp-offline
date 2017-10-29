import TranslationSyncUpManager from './syncupManagers/TranslationSyncUpManager';
import AmpAssetSyncUpManager from './syncupManagers/AmpAssetSyncUpManager';
import FMSyncUpManager from './syncupManagers/FMSyncUpManager';
import * as ClientSettingsHelper from '../helpers/ClientSettingsHelper';
import { DEFAULT_SETUP_COMPLETE } from '../../utils/constants/ClientSettingsConstants';
import Logger from '../../modules/util/LoggerManager';
import SyncUpManager from './SyncUpManager';
import { loadFMTree } from '../../actions/StartUpAction';
import { IS_DEV_MODE } from '../util/ElectronApp';

const logger = new Logger('SetupSyncUpManager.js');

/**
 * Simple Sync Up Manager for the initial setup, before the real sync up is done. No detailed sync up status is tracked.
 * This sync-up will be run silently (without user action) only once to pre-sync minimum set of data required for
 * a better user experience.
 * Pre-synced data samples: some translations, FM settings, Country Flag
 *
 * @author Nadejda Mandrescu
 */
const SetupSyncUpManager = {
  /**
   * Initiates the presync of minimum data needed for a better user experience, as long as it is needed.
   * @return {Promise.<TResult>}
   */
  syncUpMinimumData() {
    logger.log('syncUpMinimumData');
    return Promise.all([SyncUpManager.getLastSyncUpLog(), ClientSettingsHelper.findSettingById(DEFAULT_SETUP_COMPLETE)])
      .then(([lastSyncUpLog, setupCompleteSetting]) => {
        if (lastSyncUpLog.id || setupCompleteSetting.value) {
          logger.log('Minimum data pre-sync not needed.');
          return Promise.resolve();
        }
        return SetupSyncUpManager._doMinimumDataSyncUp(setupCompleteSetting);
      })
      .catch(error => {
        logger.error(`Could not sync up minimum data: ${error}`);
      });
  },

  /**
   * Right now existing translations and FM settings are not in a big amount. So instead of syncing only those that
   * are needed before the initial sync, it will be easier to sync them all. It will have almost no impact on the
   * traffic and speed of this pre-sync up, while tracking the differences and managing them will make the workflow
   * more complicated and bugs prone. Once it will be needed, we can add more granular pre-sync of some data.
   */
  _doMinimumDataSyncUp(setupCompleteSetting) {
    logger.debug('_doMinimumDataSyncUp');
    const presync = !IS_DEV_MODE || +process.env.PRE_SYNC;
    const syncUpPromise = !presync ? Promise.resolve() : Promise.all([
      new TranslationSyncUpManager().doSyncUp(),
      new AmpAssetSyncUpManager().doSyncUp(true),
      new FMSyncUpManager().doSyncUp(true),
    ]);
    return syncUpPromise.then(() => {
      setupCompleteSetting.value = true;
      return ClientSettingsHelper.saveOrUpdateSetting(setupCompleteSetting);
    }).then(SetupSyncUpManager._postSyncUp);
  },

  _postSyncUp() {
    return Promise.all([
      SyncUpManager.dispatchLoadAllLanguages(),
      loadFMTree()
    ]);
  }

};

export default SetupSyncUpManager;
