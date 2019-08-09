import { Constants, ErrorConstants } from 'amp-ui';
import DatabaseManager from '../database/DatabaseManager';

import { stringToId } from '../../utils/Utils';
import Logger from '../../modules/util/LoggerManager';

const logger = new Logger('Global settings helper');

const GlobalSettingsHelper = {

  saveGlobalSetting(setting) {
    logger.log('saveGlobalSetting');
    if (Object.keys(setting).length > 1) {
      throw new Notification(
        { message: 'MoreThanOneRecord', origin: ErrorConstants.NOTIFICATION_ORIGIN_WRONG_METHOD_USAGE });
    }
    let teamMember;
    Object.keys(setting).forEach((key) => {
      teamMember = this._convertGlobalSetting(setting, key);
    });
    return DatabaseManager.saveOrUpdate(teamMember.id, teamMember, Constants.COLLECTION_GLOBAL_SETTINGS, {});
  },
  saveGlobalSettings(settings) {
    logger.log('saveOrUpdateGlobalSetting');
    // The normal structure of GS is {key|value} so we need to convert to {id|key|value}
    // for each element on settingsList.
    const newList = [];
    Object.keys(settings).forEach((key) => {
      newList.push(this._convertGlobalSetting(settings, key));
    });
    return DatabaseManager.saveOrUpdateCollection(newList, Constants.COLLECTION_GLOBAL_SETTINGS);
  },

  /**
   * Find Global setting by id
   * @param id
   * @returns {Promise}
   */
  findById(id) {
    logger.log('findGlobalSettingById');
    return this.findSetting({ id });
  },
  /**
   * Find Global setting by key
   * @param name
   * @returns {Promise}
   */
  findByKey(key) {
    logger.log('findSettingByName');
    return this.findSetting({ key });
  },
  /**
   * Find a Global setting by a set of filters
   * @param filter filters to apply
   * @returns {Promise}
   */
  findSetting(filter) {
    logger.log('findSetting');
    return DatabaseManager.findOne(filter, Constants.COLLECTION_GLOBAL_SETTINGS);
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
    logger.log('deleteByIdWSSettings');
    return DatabaseManager.removeById(gsSettingsId, Constants.COLLECTION_GLOBAL_SETTINGS);
  },

  findAll(filter, projections) {
    logger.log('findAll');
    return DatabaseManager.findAll(filter, Constants.COLLECTION_GLOBAL_SETTINGS, projections);
  },
};

module.exports = GlobalSettingsHelper;
