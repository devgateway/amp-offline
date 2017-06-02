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
  }
};

module.exports = CurrencyRatesHelper;
