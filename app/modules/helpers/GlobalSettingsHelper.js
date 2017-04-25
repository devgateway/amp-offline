import DatabaseManager from '../database/DatabaseManager';
import { COLLECTION_GLOBAL_SETTINGS } from '../../utils/Constants';
import { NOTIFICATION_ORIGIN_WRONG_METHOD_USAGE } from '../../utils/constants/ErrorConstants';

import { stringToId } from '../../utils/Utils';
import LoggerManager from '../../modules/util/LoggerManager';

const GlobalSettingsHelper = {

  saveGlobalSetting(setting) {
    LoggerManager.log('saveGlobalSetting');
    if (Object.keys(setting).length > 1) {
      throw new Notification({ message: 'MoreThanOneRecord', origin: NOTIFICATION_ORIGIN_WRONG_METHOD_USAGE });
    }
    let teamMember;
    Object.keys(setting).forEach((key) => {
      teamMember = this._convertGlobalSetting(setting, key);
    });
    return DatabaseManager.saveOrUpdate(teamMember.id, teamMember, COLLECTION_GLOBAL_SETTINGS, {});
  },
  saveGlobalSettings(settings) {
    LoggerManager.log('saveOrUpdateGlobalSetting');
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
    LoggerManager.log('findGlobalSettingById');
    return this.findSetting({ id });
  },
  /**
   * Find Global setting by key
   * @param name
   * @returns {Promise}
   */
  findByKey(key) {
    LoggerManager.log('findSettingByName');
    return this.findSetting({ key });
  },
  /**
   * Find a Global setting by a set of filters
   * @param filter filters to apply
   * @returns {Promise}
   */
  findSetting(filter) {
    LoggerManager.log('findSetting');
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
    LoggerManager.log('deleteByIdWSSettings');
    return DatabaseManager.removeById(gsSettingsId, COLLECTION_GLOBAL_SETTINGS);
  },

  findAll(filter, projections) {
    LoggerManager.log('findAll');
    return DatabaseManager.findAll(filter, COLLECTION_GLOBAL_SETTINGS, projections);
  },
};

module.exports = GlobalSettingsHelper;
