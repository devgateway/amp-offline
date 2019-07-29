import { validate } from 'jsonschema';
import * as DatabaseManager from '../database/DatabaseManager';
import { COLLECTION_CLIENT_SETTINGS } from '../../utils/Constants';
import Notification from './NotificationHelper';
import Logger from '../../modules/util/LoggerManager';
import * as Utils from '../../utils/Utils';

const logger = new Logger('Client settings helper');

const INVALID_FORMAT_ERROR = new Notification({ message: 'INVALID_FORMAT' });

/**
 * A simplified helper for 'Client Settings' storage for loading, searching /
 *  filtering and saving client settings.
 *  The structure to fulfill to ensure we can store, use and display settings properly:
 *  {
 *  'id': 1, // setting id
 *  'name': 'AMP Offline Client Enabled', // setting name that can be used to display and translate
 *  'description': 'Clarifies if the AMP Offline client can still be used, controlled at AMP server',
 *  'visible': false, // specifies if this option should be displayed in the Client Settings page to be adjusted
 *  'type': 'boolean', // a hint for the value type, mainly for free text entry validation
 *  'options': [true, false], // an array of possible value options or null for free text
 *  'value': true, // setting value
 *  // update date in ISO-8601, that will be changed automatically at save/update time
 *  'updated-at': '2016-12-22T13:33:15.123Z'
 * }
 */
const settingsSchema = {
  id: '/SimpleSettings',
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    visible: { type: 'boolean' },
    public: { type: 'public' },
    type: { type: 'string' },
    options: { type: 'array' },
    value: { type: ['boolean', 'string', 'integer', 'object'] },
    'updated-at': { type: 'Date' }
  },
  required: ['id', 'name', 'visible', 'type']
};


const ClientSettingsHelper = {

  /**
   * Find setting by id
   * @param id
   * @returns {Promise}
   */
  findSettingById(id) {
    logger.debug('findSettingById');
    return this.findSetting({ id });
  },

  /**
   * Find setting by name
   * @param name
   * @returns {Promise}
   */
  findSettingByName(name) {
    logger.debug('findSettingByName');
    return this.findSetting({ name });
  },

  /**
   * Find a setting by a set of filters
   * @param filter filters to apply
   * @returns {Promise}
   */
  findSetting(filter) {
    logger.debug('findSetting');
    return DatabaseManager.findOne(filter, COLLECTION_CLIENT_SETTINGS);
  },

  /**
   * Find all visible settings
   * @returns {Promise}
   */
  findAllVisibleSettings(filter = {}) {
    logger.debug('findAllVisibleSettings');
    filter.visible = true;
    return this.findAll(filter);
  },

  findAllSettingsByNames(names) {
    logger.debug('findAllSettingsByNames');
    const filter = { name: { $in: names } };
    return this.findAll(filter);
  },

  findAllSettingsByNamesAndMapByKey(names) {
    return this.findAllSettingsByNames(names).then(Utils.toMapByKey);
  },

  findAll(filter) {
    return DatabaseManager.findAll(filter, COLLECTION_CLIENT_SETTINGS);
  },

  /**
   * Save or update a setting
   * @param setting
   * @returns {Promise}
   */
  saveOrUpdateSetting(setting) {
    logger.log('saveOrUpdateSetting');
    // logger.log(validate(setting, settingsSchema));
    if (validate(setting, settingsSchema).valid) {
      logger.debug(`Valid setting.id = ${setting.id}`);
      setting['updated-at'] = (new Date()).toISOString();
      return DatabaseManager.saveOrUpdate(setting.id, setting, COLLECTION_CLIENT_SETTINGS);
    }
    return Promise.reject(INVALID_FORMAT_ERROR);
  },

  saveOrUpdateCollection(settings) {
    logger.log('saveOrUpdateCollection');
    if (settings.every(setting => validate(setting, settingsSchema).valid)) {
      settings.forEach(setting => {
        setting['updated-at'] = (new Date()).toISOString();
      });
      return DatabaseManager.saveOrUpdateCollection(settings, COLLECTION_CLIENT_SETTINGS);
    }
    return Promise.reject(INVALID_FORMAT_ERROR);
  },

  /**
   * Delete a setting by id
   * @param id the setting id
   * @returns {Promise}
   */
  deleteById(id) {
    logger.debug('deleteById');
    return DatabaseManager.removeById(id, COLLECTION_CLIENT_SETTINGS);
  }

};

module.exports = ClientSettingsHelper;
