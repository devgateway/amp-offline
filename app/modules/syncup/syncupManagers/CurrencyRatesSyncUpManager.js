import { Constants } from 'amp-ui';
import CurrencyRatesHelper from '../../helpers/CurrencyRatesHelper';
import AbstractAtomicSyncUpManager from './AbstractAtomicSyncUpManager';
import ConnectionHelper from '../../connectivity/ConnectionHelper';
import Utils from '../../../utils/Utils';
import {
  GET_FULL_EXCHANGE_RATES,
  GET_INCREMENTAL_EXCHANGE_RATES,
  LAST_SYNC_TIME_PARAM
} from '../../connectivity/AmpApiConstants';

/* eslint-disable class-methods-use-this */

export default class CurrencyRatesSyncUpManager extends AbstractAtomicSyncUpManager {

  constructor() {
    super(Constants.SYNCUP_TYPE_EXCHANGE_RATES);
  }

  /**
   * Go to an EP, get the list of Currency Rates and save it in a collection.
   * If the rates are already saved in the database a partial sync will be performed.
   * @returns {Promise}
   */
  doAtomicSyncUp() {
    return CurrencyRatesHelper.findAll({}).then(currencyRates => {
      if (Object.keys(currencyRates).length === 0) {
        // we go and fetch full sync
        return ConnectionHelper.doGet({ url: GET_FULL_EXCHANGE_RATES, shouldRetry: true }).then(rawCurrencyRates =>
          this._doFullSync(rawCurrencyRates));
      } else {
        return this._doPartialSync(currencyRates);
      }
    });
  }

  /**
   * Perform a full currency sync
   * @param rawCurrencyRates
   * @returns {*|Promise}
   * @private
   */
  _doFullSync(rawCurrencyRates) {
    rawCurrencyRates.forEach(rate => {
      rate.id = this._fromToToId(rate['currency-pair']);
      this._orderRates(rate.rates);
    });
    return CurrencyRatesHelper.replaceAllCurrencyRates(rawCurrencyRates);
  }

  /**
   * Performs an incremental sync. We first remove all reported dates. Then for those dates, we add the rates
   * to all currency pairs.
   * @param currencyRates
   * @returns {*|Promise.<TResult>}
   */
  _doPartialSync(currencyRates) {
    // with the timestamp we go and fetch the partial sync
    const paramsMap = { [LAST_SYNC_TIME_PARAM]: this._lastSyncTimestamp };
    return ConnectionHelper.doGet({
      shouldRetry: true,
      url: GET_INCREMENTAL_EXCHANGE_RATES,
      paramsMap
    }).then(updatedCurrencyRates =>
      this._processPartialSync(currencyRates, updatedCurrencyRates)
    );
  }

  _processPartialSync(currencyRates, updatedCurrencyRates) {
// we first remove the rates for the reported dates
    currencyRates.forEach((currencyPair) => {
      currencyPair.rates = currencyPair.rates.filter(elementToDelete =>
        !updatedCurrencyRates['changed-dates'].includes(elementToDelete.date));
    });
    updatedCurrencyRates['exchange-rates-for-pairs'].forEach((ratesToAdd) => {
      let currencyPair = currencyRates.find(elementToFind =>
        (elementToFind['currency-pair'].to === ratesToAdd['currency-pair'].to &&
        elementToFind['currency-pair'].from === ratesToAdd['currency-pair'].from)
      );
      if (currencyPair) { // found in currency pair
        currencyPair.rates = [...currencyPair.rates, ...ratesToAdd.rates];
      } else {
        currencyPair = {
          'currency-pair': {
            from: ratesToAdd['currency-pair'].from,
            to: ratesToAdd['currency-pair'].to
          },
          rates: ratesToAdd.rates,
          id: this._fromToToId(ratesToAdd['currency-pair'])
        };
        currencyRates.push(currencyPair);
      }
      // now order the array
      if (currencyPair.rates.length > 1) {
        this._orderRates(currencyPair.rates);
      }
    });
    const filteredCurrencyRatesWithNoEmpty = currencyRates.filter(elementToFilter =>
      elementToFilter.rates.length !== 0
    );
    return CurrencyRatesHelper.replaceAllCurrencyRates(filteredCurrencyRatesWithNoEmpty);
  }

  /**
   * Sort the given rates array by date having the newer rate first
   * @param arryToOrder
   * @private
   */
  _orderRates(arrayToOrder) {
    arrayToOrder.sort((a, b) => {
      if (a.date < b.date) return 1;
      if (a.date > b.date) return -1;
      return 0;
    });
  }

  _fromToToId(currencyPair) {
    return Utils.stringToUniqueId(currencyPair.from + currencyPair.to);
  }
}
