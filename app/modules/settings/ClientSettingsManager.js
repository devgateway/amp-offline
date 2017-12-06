import DEFAULT_SETTINGS from './DefaultSettings';
import * as ClientSettingsHelper from '../helpers/ClientSettingsHelper';

/**
 * Client settings manager to get default setting(s), to use settings builders, etc
 * @author Nadejda Mandrescu
 */
export default class ClientSettingsManager {
  /**
   * Initializes default settings with new found definitions, that are not present yet in DB
   */
  static initDBWithDefaults() {
    return ClientSettingsHelper.findAll().then(settings => {
      const existingIds = new Set(settings.map(s => s.id));
      const newSettings = DEFAULT_SETTINGS.filter(defaultConfigSetting => !existingIds.has(defaultConfigSetting.id));
      if (newSettings.length) {
        return ClientSettingsHelper.saveOrUpdateCollection(newSettings);
      }
      return Promise.resolve();
    });
  }

  static getDefaultSettingConfig(id) {
    return DEFAULT_SETTINGS.find(setting => setting.id === id);
  }

  static buildInternalSetting(id, type, value, options) {
    return ClientSettingsManager.buildSetting(id, id, false, type, value, options);
  }

  static buildSetting(id, name, visible, type, value, options) {
    name = name || id;
    return { id, name, visible, type, value, options };
  }

  static getVisibleSettings(isPublic) {
    const filter = isPublic ? { public: true } : {};
    return ClientSettingsHelper.findAllVisibleSettings(filter);
  }
}
