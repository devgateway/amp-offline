import * as DatabaseManager from '../database/DatabaseManager';
import { COLLECTION_CURRENCY_RATES } from '../../utils/Constants';
import LoggerManager from '../../modules/util/LoggerManager';

/**
 * A simplified helper for 'Workspace Settings' storage for loading, searching / filtering and saving ws settings.
 */
const CurrencyRatesHelper = {

  /**
   * Find rates by pair settings by workspace setting id
   * @param currecnyFrom
   * @param currecnyTo
   * @returns {Promise}
   */
  findByFromAndTo(currencyFrom, currencyTo) {
    LoggerManager.log('findById');
    const filter = { 'currency-pair': { to: currencyTo, from: currencyFrom } };

    return DatabaseManager.findOne(filter, COLLECTION_CURRENCY_RATES);
  },

  findAll(filter) {
    LoggerManager.log('findAll');
    return DatabaseManager.findAll(filter, COLLECTION_CURRENCY_RATES);
  },
  /**
   * Replaces all existing workspace settings with a new collection of workspace settings
   * @param wsSettingsCollection
   * @returns {Promise}
   */
  replaceAllCurrencyRates(currencyRatesCollection) {
    LoggerManager.log('replaceAllCurrencyRates');
    return DatabaseManager.replaceCollection(currencyRatesCollection, COLLECTION_CURRENCY_RATES, {});
  },

  saveCurrencyRate(currencyRate) {
    LoggerManager.log('saveCurrencyRate');
    return DatabaseManager.saveOrUpdate(currencyRate.id, currencyRate, COLLECTION_CURRENCY_RATES, {});
  },
  /**
   * Find workspace settings by workspace id
   * @param workspaceId
   * @returns {Promise}
   */
  /*findByWorkspaceId(workspaceId) {
   LoggerManager.log('findByWorkspaceId');
   const filter = { 'workspace-id': workspaceId };
   return DatabaseManager.findOne(filter, COLLECTION_WS_SETTINGS);
   },

   */
  /**
   * Save or update workspace settings
   * @param wsSettings workspace settings
   * @returns {Promise}
   */
  /*saveOrUpdateWSSettings(wsSettings) {
   LoggerManager.log('saveOrUpdateWSSettings');
   retu  rn DatabaseManager.saveOrUpdate(wsSettings.id, wsSettings, COLLECTION_CURRENCY_RATES, {});
   },
   */
  /**
   * Save or update a collection of workspace settings
   * @param wsSettingsCollection
   * @returns {Promise}
   */
  /*saveOrUpdateWSSettingsCollection(wsSettingsCollection) {
   LoggerManager.log('saveOrUpdateWSSettingsCollection');
   return DatabaseManager.saveOrUpdateCollection(wsSettingsCollection, COLLECTION_CURRENCY_RATES);
   },
   */
  /**
   * Deletes a workspace setting
   * @param wsSettingsId
   * @returns {Promise}
   */
  /*deleteById(wsSettingsId) {
   LoggerManager.log('saveOrUpdateWSSettings');
   return DatabaseManager.removeById(wsSettingsId, COLLECTION_CURRENCY_RATES);
   },
   */
  /**
   * Replaces all existing workspace settings with a new collection of workspace settings
   * @param wsSettingsCollection
   * @returns {Promise}
   */
  /*replaceAllWSSettings(wsSettingsCollection) {
   LoggerManager.log('replaceAllWSSettings');
   return DatabaseManager.replaceCollection(wsSettingsCollection, COLLECTION_CURRENCY_RATES, {});
   }
   */
};

module.exports = CurrencyRatesHelper;
