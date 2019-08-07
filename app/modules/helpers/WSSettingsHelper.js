import { Constants } from 'amp-ui';
import * as DatabaseManager from '../database/DatabaseManager';
import Logger from '../../modules/util/LoggerManager';

const logger = new Logger('WS Settings Helper');

/**
 * A simplified helper for 'Workspace Settings' storage for loading, searching / filtering and saving ws settings.
 */
const WSSettingsHelper = {

  /**
   * Find workspace settings by workspace setting id
   * @param wsSettingId
   * @returns {Promise}
   */
  findById(wsSettingId) {
    logger.log('findById');
    const filter = { id: wsSettingId };
    return DatabaseManager.findOne(filter, Constants.COLLECTION_WS_SETTINGS);
  },

  /**
   * Find workspace settings by workspace id
   * @param workspaceId
   * @returns {Promise}
   */
  findByWorkspaceId(workspaceId) {
    logger.log('findByWorkspaceId');
    const filter = { 'workspace-id': workspaceId };
    return DatabaseManager.findOne(filter, Constants.COLLECTION_WS_SETTINGS);
  },

  findAll(filter) {
    logger.log('findAll');
    return DatabaseManager.findAll(filter, Constants.COLLECTION_WS_SETTINGS);
  },

  /**
   * Save or update workspace settings
   * @param wsSettings workspace settings
   * @returns {Promise}
   */
  saveOrUpdateWSSettings(wsSettings) {
    logger.log('saveOrUpdateWSSettings');
    return DatabaseManager.saveOrUpdate(wsSettings.id, wsSettings, Constants.COLLECTION_WS_SETTINGS, {});
  },

  /**
   * Save or update a collection of workspace settings
   * @param wsSettingsCollection
   * @returns {Promise}
   */
  saveOrUpdateWSSettingsCollection(wsSettingsCollection) {
    logger.log('saveOrUpdateWSSettingsCollection');
    return DatabaseManager.saveOrUpdateCollection(wsSettingsCollection, Constants.COLLECTION_WS_SETTINGS);
  },

  /**
   * Deletes a workspace setting
   * @param wsSettingsId
   * @returns {Promise}
   */
  deleteById(wsSettingsId) {
    logger.log('saveOrUpdateWSSettings');
    return DatabaseManager.removeById(wsSettingsId, Constants.COLLECTION_WS_SETTINGS);
  },

  /**
   * Replaces all existing workspace settings with a new collection of workspace settings
   * @param wsSettingsCollection
   * @returns {Promise}
   */
  replaceAllWSSettings(wsSettingsCollection) {
    logger.log('replaceAllWSSettings');
    return DatabaseManager.replaceCollection(wsSettingsCollection, Constants.COLLECTION_WS_SETTINGS);
  }
};

module.exports = WSSettingsHelper;
