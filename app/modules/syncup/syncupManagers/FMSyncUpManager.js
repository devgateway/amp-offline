import ConnectionHelper from '../../connectivity/ConnectionHelper';
import { SYNCUP_TYPE_FEATURE_MANAGER } from '../../../utils/Constants';
import { FEATURE_MANAGER_URL } from '../../connectivity/AmpApiConstants';
import AbstractAtomicSyncUpManager from './AbstractAtomicSyncUpManager';
import * as FMPaths from '../../../utils/constants/FeatureManagerConstants';
import Logger from '../../util/LoggerManager';
import FMHelper from '../../helpers/FMHelper';
import FeatureManager from '../../util/FeatureManager';

const logger = new Logger('FM sync up manager');

/* eslint-disable class-methods-use-this */

/**
 * Feature Manager Sync up Manager
 * @author Nadejda Mandrescu
 */
export default class FMSyncUpManager extends AbstractAtomicSyncUpManager {

  constructor() {
    super(SYNCUP_TYPE_FEATURE_MANAGER);
    this.fmPaths = Object.values(FMPaths);
  }

  doAtomicSyncUp() {
    logger.log('doAtomicSyncUp');
    const body = this._getRequestBody();
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

  _getRequestBody() {
    const fmModules = this._getModules(this.fmPaths);
    return {
      'reporting-fields': false,
      'enabled-modules': false,
      'full-enabled-paths': false,
      'detail-modules': fmModules,
      'fm-paths': this.fmPaths
    };
  }

  _getModules(fmPaths) {
    return Array.from(new Set(fmPaths.map((path: String) => path.substring(1, path.indexOf('/', 1)).toUpperCase())));
  }

  _setUndetectedFMSettingsAsDisabled(newFmTree) {
    const futureFM = new FeatureManager(newFmTree);
    this.fmPaths.forEach(fmPath => {
      if (!futureFM.hasFMSetting(fmPath)) {
        logger.warn('FM Path was not found in AMP. Either it doesn\'t exist or the path is wrong. Storing as disabled.'
          + `FM Path = ${fmPath}`);
        futureFM.setFMSetting(fmPath, false);
      }
    });
  }

}
