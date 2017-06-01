import CurrencyRatesHelper from '../../helpers/CurrencyRatesHelper';
import AbstractAtomicSyncUpManager from './AbstractAtomicSyncUpManager';
import ConnectionHelper from '../../connectivity/ConnectionHelper';
import Utils from '../../../utils/Utils';
import SyncUpHelper from '../../helpers/SyncUpHelper';
import { GET_FULL_EXCHANGE_RATES, GET_INCREMENTAL_EXCHANGE_RATES } from '../../connectivity/AmpApiConstants';
import { SYNCUP_DATETIME_FIELD } from '../../../utils/Constants';

/* eslint-disable class-methods-use-this */

export default class CurrencyRatesSyncUpManager extends AbstractAtomicSyncUpManager {
  /**
   * Go to an EP, get the list of global settings and save it in a collection,
   * thats the only responsibility of this function.
   * @returns {Promise}
   */
  doAtomicSyncUp() {
    return CurrencyRatesHelper.findAll({}).then(currencyRates => {
      if (Object.keys(currencyRates).length === 0) {
        // we go and fetch full sync
        return ConnectionHelper.doGet({ url: GET_FULL_EXCHANGE_RATES }).then(rawCurrencyRates => {
          rawCurrencyRates.forEach(rate => {
            rate.id = this._fromToToId(rate['currency-pair']);
          });
          return CurrencyRatesHelper.replaceAllCurrencyRates(rawCurrencyRates);
        });
      } else {
        return SyncUpHelper.getLastSyncUpLog().then(lastSyncUpLog => {
          const timeStamp = lastSyncUpLog[SYNCUP_DATETIME_FIELD];
          // with the timestamp we go and fetch the partial sync
          const paramsMap = { 'last-sync-time': timeStamp };
          return ConnectionHelper.doGet({
            url: GET_INCREMENTAL_EXCHANGE_RATES,
            paramsMap
          }).then((updatedCurrencyRates) => {
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
                  rates: [],
                  id: this._fromToToId(ratesToAdd['currency-pair'])
                };
                currencyPair.rates = [...currencyPair.rates, ...ratesToAdd.rates];
                currencyRates.push(currencyPair);
              }
              // now order the array
              if (currencyPair.rates.length > 1) {
                currencyPair.rates.sort((a, b) => (new Date(b.date)).getTime() - (new Date(a.date)).getTime());
              }
            });
            const filteredCurrencyRatesWithNoEmpty = currencyRates.filter(elementToFilter =>
              elementToFilter.rates.length !== 0
            );
            return CurrencyRatesHelper.replaceAllCurrencyRates(filteredCurrencyRatesWithNoEmpty);
          });
        });
      }
    });
  }

  static _fromToToId(currencyPair) {
    return Utils.stringToUniqueId(currencyPair.from + currencyPair.to);
  }
}
