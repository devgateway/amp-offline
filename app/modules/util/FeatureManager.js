import store from '../../index';
import LoggerManager from './LoggerManager';

/**
 * Feature Manager
 * @author Nadejda Mandrescu
 */
const FeatureManager = {
  /**
   * Checks if the given FM path is fully enabled or only last segment is enabled
   * @param fmPath the FM path, e.g. '/PROJECT MANAGEMENT/Funding/Funding Information/Delivery rate'
   * @param onlyLastSegment specifies if to check if only the last segment is enabled (the AMP behavior for some cases)
   * @return {boolean}
   */
  isFMSettingEnabled(fmPath, onlyLastSegment) {
    LoggerManager.log('isFMSettingEnabled');
    const fmTree = store.getState().startUpReducer.fmTree;
    if (fmTree) {
      return this._isFMSettingEnabled(fmPath, onlyLastSegment, fmTree);
    }
    return false;
  },

  _isFMSettingEnabled(fmPath, onlyLastSegment, fmTree) {
    let lastFMSubTree = fmTree;
    // ignore first "/" to exlcude empty string from the split
    const segments = fmPath.substring(1).split('/');
    const foundLastFMSubTree = segments.every(segment => {
      lastFMSubTree = lastFMSubTree[segment];
      return lastFMSubTree !== undefined && (lastFMSubTree.__enabled || onlyLastSegment);
    });
    return foundLastFMSubTree && lastFMSubTree.__enabled;
  }
};

export default FeatureManager;
