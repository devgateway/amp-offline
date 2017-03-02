import DatabaseManager from '../database/DatabaseManager';
import { COLLECTION_CLIENT_SETTINGS } from '../../utils/Constants';
import { validate } from "jsonschema";
import Notification from './NotificationHelper';

const INVALID_FORMAT_ERROR = new Notification({message: 'INVALID_FORMAT'});

/**
 * A simplified helper for "Client Settings" storage for loading, searching /
 *  filtering and saving client settings.
 *  The structure to fulfill to ensure we can store, use and display settings properly:
 *  {
 *  "id": 1, // setting id
 *  "name": "AMP Offline Client Enabled", // setting name that can be used to display and translate
 *  "description": "Clarifies if the AMP Offline client can still be used, controlled at AMP server", // setting description
 *  "visible": false, // specifies if this option should be displayed in the Client Settings page to be adjusted
 *  "type": "boolean", // a hint for the value type, mainly for free text entry validation
 *  "options": [true, false], // an array of possible value options or null for free text
 *  "value": true, // setting value
 *  "updated-at": "2016-12-22T13:33:15.123Z" // update date in ISO-8601, that will be changed automatically at save/update time
 * }
 */
const settingsSchema = {
  "id": "/SimpleSettings",
  "type": "object",
  "properties": {
    "id": {"type": "string"},
    "name": {"type": "string"},
    "visible": {"type": "boolean"},
    "type": {"type": "string"},
    "options": {"type": "array"},
    "value": {"type": ["boolean", "string", "integer"]},
    "updated-at": {"type": "Date"}
  },
  "required": ["id", "name", "visible", "type", "value"]
};


const ClientSettingsHelper = {

  /**
   * Find setting by id
   * @param id
   * @returns {Promise}
   */
  findSettingById(id) {
    console.log('findSettingById');
    return this.findSetting({id: id});
  },

  /**
   * Find setting by name
   * @param name
   * @returns {Promise}
   */
  findSettingByName(name) {
    console.log('findSettingByName');
    return this.findSetting({name: name});
  },

  /**
   * Find a setting by a set of filters
   * @param filter filters to apply
   * @returns {Promise}
   */
  findSetting(filter) {
    console.log('findSetting');
    return new Promise(function (resolve, reject) {
      DatabaseManager.findOne(filter, COLLECTION_CLIENT_SETTINGS).then(resolve).catch(reject);
    });
  },

  /**
   * Find all visible settings
   * @returns {*}
   */
  findAllVisibleSettings() {
    console.log('findAllVisibleSettings');
    return this.findAll({visible: true});
  },

  findAll(filter) {
    return new Promise(function (resolve, reject) {
      DatabaseManager.findAll(filter, COLLECTION_CLIENT_SETTINGS).then(resolve).catch(reject);
    });
  },

  /**
   * Save or update a setting
   * @param setting
   * @returns {Promise}
   */
  saveOrUpdateSetting(setting) {
    console.log('saveOrUpdateSetting');
    //console.log(validate(setting, settingsSchema));
    return new Promise(function (resolve, reject) {
      if (validate(setting, settingsSchema).valid) {
        console.log('Valid setting.id = ' + setting.id);
        setting["updated-at"] = (new Date()).toISOString();
        DatabaseManager.saveOrUpdate(setting.id, setting, COLLECTION_CLIENT_SETTINGS, {}).then(resolve).catch(reject);
      } else {
        reject(INVALID_FORMAT_ERROR);
      }
    });
  },

  /**
   * Delete a setting by id
   * @param id the setting id
   * @returns {Promise}
   */
  deleteById(id) {
    console.log('deleteById');
    return new Promise(function (resolve, reject) {
      DatabaseManager.removeById(id, COLLECTION_CLIENT_SETTINGS, {}).then(resolve).catch(reject);
    });
  }

};

module.exports = ClientSettingsHelper;