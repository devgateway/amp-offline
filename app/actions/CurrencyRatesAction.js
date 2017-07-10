/**
 * Created by Julian de Anquin
 */
import CurrencyRatesHelper from '../modules/helpers/CurrencyRatesHelper';
import GlobalSettingsHelper from '../modules/helpers/GlobalSettingsHelper';
import LoggerManager from '../modules/util/LoggerManager';
import { DEFAULT_CURRENCY } from '../utils/constants';
import { BASE_CURRENCY_KEY } from '../utils/constants/GlobalSettingsConstants';

export const STATE_LOADING_CURRENCY_RATES = 'STATE_LOADING_CURRENCY_RATES';
export const STATE_CURRENCY_RATES_LOADED = 'STATE_CURRENCY_RATES_LOADED';

export function sendingRequest() {
  LoggerManager.log('sendingRequest');
  return {
    type: STATE_LOADING_CURRENCY_RATES
  };
}

export function loadCurrencyRates() {
  LoggerManager.log('loadAllLanguages');
  return dispatch => new Promise((resolve, reject) => {
    dispatch(sendingRequest());
    return CurrencyRatesHelper.findAll({}).then((rates) =>
      GlobalSettingsHelper.findByKey(BASE_CURRENCY_KEY).then((gsBaseCurrency) => {
        // gsBaseCurrency is undefined it means that its the first time we run the app
        // we will use the default currency USD
        let baseCurrency;
        if (gsBaseCurrency) {
          baseCurrency = gsBaseCurrency.value;
        } else {
          baseCurrency = DEFAULT_CURRENCY;
        }
        return dispatch(ratesLoaded(rates, baseCurrency));
      })
    ).catch(reject);
  });
}
function ratesLoaded(rates, baseCurrency) {
  LoggerManager.log('ratesLoaded');
  const payload = {};
  payload.rates = rates;
  payload.baseCurrency = baseCurrency;
  return {
    type: STATE_CURRENCY_RATES_LOADED,
    actionData: payload
  };
}
