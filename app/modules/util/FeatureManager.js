import Logger from './LoggerManager';

const logger = new Logger('Feature manager');

/**
 * Feature Manager
 * @author Nadejda Mandrescu
 */
export default class FeatureManager {
  static _currentFM = new FeatureManager();

  constructor(fmTree) {
    this._fmTree = fmTree;
  }

  set fmTree(fmTree) {
    this._fmTree = fmTree;
  }

  static setFMTree(fmTree) {
    FeatureManager._currentFM.fmTree = fmTree;
  }

  /**
   * Checks if the given FM path is fully enabled or only last segment is enabled
   * @param fmPath the FM path, e.g. '/PROJECT MANAGEMENT/Funding/Funding Information/Delivery rate'
   * @param onlyLastSegment specifies if to check if only the last segment is enabled (the AMP behavior for some cases)
   * @return {boolean}
   */
  static isFMSettingEnabled(fmPath, onlyLastSegment) {
    return FeatureManager._currentFM.isFMSettingEnabled(fmPath, onlyLastSegment);
  }

  isFMSettingEnabled(fmPath, onlyLastSegment) {
    logger.debug('isFMSettingEnabled');
    // store.getState().startUpReducer.fmTree;
    if (this._fmTree) {
      let lastFMSubTree = this._fmTree;
      // ignore first "/" to exclude empty string from the split
      const segments = fmPath.substring(1).split('/');
      const foundLastFMSubTree = segments.every(segment => {
        lastFMSubTree = lastFMSubTree[segment];
        return lastFMSubTree !== undefined && (lastFMSubTree.__enabled || onlyLastSegment);
      });
      return foundLastFMSubTree && lastFMSubTree.__enabled;
    }
    return false;
  }
}
