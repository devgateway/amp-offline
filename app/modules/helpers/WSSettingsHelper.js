import DatabaseManager from '../database/DatabaseManager';
import { COLLECTION_WS_SETTINGS } from '../../utils/Constants';

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
    console.log('findById');
    const filter = { id: wsSettingId };
    return DatabaseManager.findOne(filter, COLLECTION_WS_SETTINGS);
  },

  /**
   * Find workspace settings by workspace id
   * @param workspaceId
   * @returns {Promise}
   */
  findByWorkspaceId(workspaceId) {
    console.log('findByWorkspaceId');
    const filter = { 'workspace-id': workspaceId };
    return DatabaseManager.findOne(filter, COLLECTION_WS_SETTINGS);
  },

  findAll(filter) {
    console.log('findAll');
    return DatabaseManager.findAll(filter, COLLECTION_WS_SETTINGS);
  },

  /**
   * Save or update workspace settings
   * @param wsSettings workspace settings
   * @returns {Promise}
   */
  saveOrUpdateWSSettings(wsSettings) {
    console.log('saveOrUpdateWSSettings');
    return DatabaseManager.saveOrUpdate(wsSettings.id, wsSettings, COLLECTION_WS_SETTINGS, {});
  },

  /**
   * Save or update a collection of workspace settings
   * @param wsSettingsCollection
   * @returns {Promise}
   */
  saveOrUpdateWSSettingsCollection(wsSettingsCollection) {
    console.log('saveOrUpdateWSSettingsCollection');
    return DatabaseManager.saveOrUpdateCollection(wsSettingsCollection, COLLECTION_WS_SETTINGS);
  },

  /**
   * Deletes a workspace setting
   * @param wsSettingsId
   * @returns {Promise}
   */
  deleteById(wsSettingsId) {
    console.log('saveOrUpdateWSSettings');
    return DatabaseManager.removeById(wsSettingsId, COLLECTION_WS_SETTINGS);
  },

  /**
   * Replaces all existing workspace settings with a new collection of workspace settings
   * @param wsSettingsCollection
   * @returns {Promise}
   */
  replaceAllWSSettings(wsSettingsCollection) {
    console.log('replaceAllWSSettings');
    return DatabaseManager.replaceCollection(wsSettingsCollection, COLLECTION_WS_SETTINGS, {});
  }
};

module.exports = WSSettingsHelper;
