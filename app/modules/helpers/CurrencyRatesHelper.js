import { Constants } from 'amp-ui';
import * as DatabaseManager from '../database/DatabaseManager';
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

    return DatabaseManager.findOne(filter, Constants.COLLECTION_CURRENCY_RATES);
  },

  /**
   * Find Currency rates  by a set of filters
   * @param filter filters to apply
   * @returns {Promise}
   */
  findAll(filter) {
    logger.log('findAll');
    return DatabaseManager.findAll(filter, Constants.COLLECTION_CURRENCY_RATES);
  },

  /**
   * Determines whether there are currency rates in the DB or not
   * @return {boolean}
   */
  hasExchangeRates() {
    return this.findAll().then(er => !!er.length);
  },

  /**
   * Replaces all existing Currency rates with a new collection of Currency Rates
   * @param currencyRatesCollection
   * @returns {Promise}
   */
  replaceAllCurrencyRates(currencyRatesCollection) {
    logger.log('replaceAllCurrencyRates');
    return DatabaseManager.replaceCollection(currencyRatesCollection, Constants.COLLECTION_CURRENCY_RATES);
  },

  saveCurrencyRate(currencyRate) {
    logger.log('saveCurrencyRate');
    return DatabaseManager.saveOrUpdate(currencyRate.id, currencyRate, Constants.COLLECTION_CURRENCY_RATES);
  }
};

module.exports = CurrencyRatesHelper;
