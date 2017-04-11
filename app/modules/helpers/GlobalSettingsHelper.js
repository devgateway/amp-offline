import DatabaseManager from '../database/DatabaseManager';
import { COLLECTION_GLOBAL_SETTINGS } from '../../utils/Constants';
import { stringToId } from '../../utils/Utils';

const GlobalSettingsHelper = {

  saveGlobalSetting(setting) {
    console.log('*****saveGlobalSetting*******');
    // Not throwing a notification error since its the callers responsibility to react to a error in code, using this
    // method with more than one key is either an error in code or in the database
    if (Object.keys(setting).length > 1) {
      throw new Error('Item should not have more than one key');
    }
    let teamMember;
    Object.keys(setting).forEach((key) => {
      teamMember = this._convertGlobalSetting(setting, key);
    });
    return DatabaseManager.saveOrUpdate(teamMember.id, teamMember, COLLECTION_GLOBAL_SETTINGS, {});
  },
  saveGlobalSettings(settings) {
    console.log('saveOrUpdateGlobalSetting');
    // The normal structure of GS is {key|value} so we need to convert to {id|key|value}
    // for each element on settingsList.
    const newList = [];
    Object.keys(settings).forEach((key) => {
      newList.push(this._convertGlobalSetting(settings, key));
    });
    return DatabaseManager.saveOrUpdateCollection(newList, COLLECTION_GLOBAL_SETTINGS);
  },

  /**
   * Find Global setting by id
   * @param id
   * @returns {Promise}
   */
  findById(id) {
    console.log('findGlobalSettingById');
    return this.findSetting({ id });
  },
  /**
   * Find Global setting by key
   * @param name
   * @returns {Promise}
   */
  findByKey(key) {
    console.log('findSettingByName');
    return this.findSetting({ key });
  },
  /**
   * Find a Global setting by a set of filters
   * @param filter filters to apply
   * @returns {Promise}
   */
  findSetting(filter) {
    console.log('findSetting');
    return DatabaseManager.findOne(filter, COLLECTION_GLOBAL_SETTINGS);
  },
  _convertGlobalSetting(settings, key) {
    const newItem = {};
    newItem.key = key;
    newItem.value = settings[key];
    newItem.id = stringToId(newItem.key);
    return newItem;
  },

  /**
   * Deletes a GlobalSetting
   * @param gsSettingsId
   * @returns {Promise}
   */
  deleteById(gsSettingsId) {
    console.log('deleteByIdWSSettings');
    return DatabaseManager.removeById(gsSettingsId, COLLECTION_GLOBAL_SETTINGS);
  }
};

module.exports = GlobalSettingsHelper;
