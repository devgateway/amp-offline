import * as DatabaseManager from '../database/DatabaseManager';
import { COLLECTION_CURRENCY_RATES } from '../../utils/Constants';
import Logger from '../../modules/util/LoggerManager';

const logger = new Logger('Currency rates helper');

/**
 * A simplified helper for 'Currency rates' storage for loading, searching / filtering and saving Currency Rates.
 */
const CurrencyRatesHelper = {

  /**
   * Find rates by pair settings by workspace setting id
   * @param currencyFrom
   * @param currencyTo
   * @returns {Promise}
   */
  findByFromAndTo(currencyFrom, currencyTo) {
    logger.log('findByFromAndTo');
    const filter = { 'currency-pair': { to: currencyTo, from: currencyFrom } };

    return DatabaseManager.findOne(filter, COLLECTION_CURRENCY_RATES);
  },
  /**
   * Find Currency rates  by a set of filters
   * @param filter filters to apply
   * @returns {Promise}
   */
  findAll(filter) {
    logger.log('findAll');
    return DatabaseManager.findAll(filter, COLLECTION_CURRENCY_RATES);
  },
  /**
   * Replaces all existing Currency rateswith a new collection of Currency Rates
   * @param currencyRatesCollection
   * @returns {Promise}
   */
  replaceAllCurrencyRates(currencyRatesCollection) {
    logger.log('replaceAllCurrencyRates');
    return DatabaseManager.replaceCollection(currencyRatesCollection, COLLECTION_CURRENCY_RATES);
  },

  saveCurrencyRate(currencyRate) {
    logger.log('saveCurrencyRate');
    return DatabaseManager.saveOrUpdate(currencyRate.id, currencyRate, COLLECTION_CURRENCY_RATES);
  }
};

module.exports = CurrencyRatesHelper;
