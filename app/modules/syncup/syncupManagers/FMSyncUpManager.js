import { Constants, FeatureManagerConstants, FeatureManager, FmManagerHelper } from 'amp-ui';
import ConnectionHelper from '../../connectivity/ConnectionHelper';
import { FEATURE_MANAGER_URL } from '../../connectivity/AmpApiConstants';
import AbstractAtomicSyncUpManager from './AbstractAtomicSyncUpManager';
import Logger from '../../util/LoggerManager';
import FMHelper from '../../helpers/FMHelper';

const logger = new Logger('FM sync up manager');

/* eslint-disable class-methods-use-this */

/**
 * Feature Manager Sync up Manager
 * @author Nadejda Mandrescu
 */
export default class FMSyncUpManager extends AbstractAtomicSyncUpManager {

  constructor() {
    super(Constants.SYNCUP_TYPE_FEATURE_MANAGER);
    this.fmPaths = Object.values(FeatureManagerConstants);
  }

  doAtomicSyncUp() {
    logger.log('doAtomicSyncUp');
    const body = FmManagerHelper.getRequestFmSyncUpBody(this.fmPaths);
    return ConnectionHelper.doPost({ url: FEATURE_MANAGER_URL, body, shouldRetry: true })
      .then((fmTree) => {
        fmTree = fmTree && fmTree['fm-settings'];
        this._setUndetectedFMSettingsAsDisabled(fmTree);
        return FMHelper.replaceAll([{ fmTree }]).then((res) => {
          // update FeatureManager with the new tree immediately to no longer report new local settings to pull
          FeatureManager.setFMTree(fmTree);
          return res;
        });
      });
  }

  getDiffLeftover() {
    return super.getDiffLeftover() || this._hasNewLocalSettingsToPull();
  }

  _hasNewLocalSettingsToPull() {
    return this.fmPaths.some(fmPath => !FeatureManager.hasFMSetting(fmPath));
  }

  _setUndetectedFMSettingsAsDisabled(newFmTree) {
    const futureFM = new FeatureManager(newFmTree, Logger);
    this.fmPaths.forEach(fmPath => {
      if (!futureFM.hasFMSetting(fmPath)) {
        logger.warn('FM Path was not found in AMP. Either it doesn\'t exist or the path is wrong. Storing as disabled.'
          + `FM Path = ${fmPath}`);
        futureFM.setFMSetting(fmPath, false);
      }
    });
  }

}
