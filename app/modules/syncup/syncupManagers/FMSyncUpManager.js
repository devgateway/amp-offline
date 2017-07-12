import ConnectionHelper from '../../connectivity/ConnectionHelper';
import { SYNCUP_TYPE_FEATURE_MANAGER } from '../../../utils/Constants';
import { FEATURE_MANAGER_URL } from '../../connectivity/AmpApiConstants';
import AbstractAtomicSyncUpManager from './AbstractAtomicSyncUpManager';
import * as FMPaths from '../../../utils/constants/FeatureManagerConstants';
import LoggerManager from '../../util/LoggerManager';
import FMHelper from '../../helpers/FMHelper';

/* eslint-disable class-methods-use-this */

/**
 * Feature Manager Sync up Manager
 * @author Nadejda Mandrescu
 */
export default class FMSyncUpManager extends AbstractAtomicSyncUpManager {

  constructor() {
    super(SYNCUP_TYPE_FEATURE_MANAGER);
  }

  doAtomicSyncUp() {
    LoggerManager.log('doAtomicSyncUp');
    const body = this._getRequestBody();
    return ConnectionHelper.doPost({ url: FEATURE_MANAGER_URL, body })
      .then((fmTree) => FMHelper.replaceAll([this._prepareData(fmTree)]));
  }

  _getRequestBody() {
    const fmPaths = Object.values(FMPaths);
    const fmModules = this._getModules(fmPaths);
    return {
      'reporting-fields': false,
      'enabled-modules': false,
      'detail-flat': false,
      'full-enabled-paths': false,
      'detail-modules': fmModules,
      'fm-paths': fmPaths
    };
  }

  _getModules(fmPaths) {
    return Array.from(new Set(fmPaths.map((path: String) => path.substring(1, path.indexOf('/', 1)).toUpperCase())));
  }

  /**
   * Transforms FM tree to Offline format
   * @param fmTree
   * @return {{}}
   * @private
   */
  _prepareData(fmTree) {
    // until AMP-26523 is done, workaround to remove the duplicate top level
    const dataToStore = {};
    Object.entries(fmTree).forEach(([key, value]) => {
      const excludeItems = new Set([key, '__enabled']);
      const firstLevelEntries = Object.keys(value).filter(subKey => !excludeItems.has(subKey));
      if (firstLevelEntries.length === 0) {
        dataToStore[key] = value[key];
      } else {
        dataToStore[key] = value;
      }
    });
    return { fmTree: dataToStore };
  }

}
