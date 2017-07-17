import store from '../../index';
import LoggerManager from './LoggerManager';

/**
 * Global Settings Manager
 * @author Nadejda Mandrescu
 */
const GlobalSettingsManager = {
  /**
   * Retrieves a global setting value by key
   * @param key the GS key
   * @return {String} raw value
   */
  getSettingByKey(key) {
    LoggerManager.log('isFMSettingEnabled');
    const globalSettings = store.getState().startUpReducer.globalSettings;
    return globalSettings ? globalSettings[key] : null;
  }
};

export default GlobalSettingsManager;
