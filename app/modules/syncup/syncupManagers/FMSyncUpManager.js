import { Constants, FeatureManagerConstants, FeatureManager, FmManagerHelper } from 'amp-ui';
import ConnectionHelper from '../../connectivity/ConnectionHelper';
import { FEATURE_MANAGER_BY_WS_URL } from '../../connectivity/AmpApiConstants';
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
    this.fmTrees = null;
  }

  doAtomicSyncUp() {
    logger.log('doAtomicSyncUp');
    const body = FmManagerHelper.getRequestFmSyncUpBody(this.fmPaths);
    return ConnectionHelper.doPost({ url: FEATURE_MANAGER_BY_WS_URL, body, shouldRetry: true })
      .then((fmTree) => {
        fmTree.forEach((tree) => {
          tree = tree['fm-tree']['fm-settings'];
          this._setUndetectedFMSettingsAsDisabled(tree);
        });
        return FMHelper.replaceAll([{ fmTree }]).then((res) => {
          this.fmTrees = fmTree;
          return res;
        });
      });
  }

  getDiffLeftover() {
    return super.getDiffLeftover() || this._hasNewLocalSettingsToPull();
  }

  _hasNewLocalSettingsToPull() {
    let result = false;
    if (this.fmTrees != null) {
      this.fmTrees.forEach(tree => {
        const subTree = tree['fm-tree']['fm-settings'];
        const futureFM = new FeatureManager(subTree, Logger);
        if (this.fmPaths.some(fmPath => !futureFM.hasFMSetting(fmPath))) {
          result = true;
        }
      });
    } else {
      result = true;
    }
    return result;
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
