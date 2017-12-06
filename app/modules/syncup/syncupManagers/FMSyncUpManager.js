import ConnectionHelper from '../../connectivity/ConnectionHelper';
import { SYNCUP_TYPE_FEATURE_MANAGER } from '../../../utils/Constants';
import { FEATURE_MANAGER_URL } from '../../connectivity/AmpApiConstants';
import AbstractAtomicSyncUpManager from './AbstractAtomicSyncUpManager';
import * as FMPaths from '../../../utils/constants/FeatureManagerConstants';
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
    super(SYNCUP_TYPE_FEATURE_MANAGER);
  }

  doAtomicSyncUp() {
    logger.log('doAtomicSyncUp');
    const body = this._getRequestBody();
    return ConnectionHelper.doPost({ url: FEATURE_MANAGER_URL, body, shouldRetry: true })
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
      const excludeItems = new Set([key.toUpperCase(), '__ENABLED']);
      let actualSubKey = key;
      const firstLevelEntries = Object.keys(value).filter(subKey => {
        const subKeyUpper = subKey.toUpperCase();
        if (subKeyUpper === key) {
          actualSubKey = subKey;
        }
        return !excludeItems.has(subKeyUpper);
      });
      if (firstLevelEntries.length === 0) {
        dataToStore[actualSubKey] = value[actualSubKey];
      } else {
        dataToStore[key] = value;
      }
    });
    return { fmTree: dataToStore };
  }

}
