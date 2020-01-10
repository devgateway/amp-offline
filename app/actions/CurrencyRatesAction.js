/**
 * Created by Julian de Anquin
 */
import { Constants, GlobalSettingsConstants } from 'amp-ui';
import CurrencyRatesHelper from '../modules/helpers/CurrencyRatesHelper';
import GlobalSettingsHelper from '../modules/helpers/GlobalSettingsHelper';
import Logger from '../modules/util/LoggerManager';

export const STATE_LOADING_CURRENCY_RATES = 'STATE_LOADING_CURRENCY_RATES';
export const STATE_CURRENCY_RATES_LOADED = 'STATE_CURRENCY_RATES_LOADED';

const logger = new Logger('Currency rates action');

export function sendingRequest() {
  logger.log('sendingRequest');
  return {
    type: STATE_LOADING_CURRENCY_RATES
  };
}

export function loadCurrencyRates() {
  logger.log('loadCurrencyRates');
  return dispatch => new Promise((resolve, reject) => {
    dispatch(sendingRequest());
    return CurrencyRatesHelper.findAll({}).then((rates) =>
      GlobalSettingsHelper.findByKey(GlobalSettingsConstants.BASE_CURRENCY_KEY).then((gsBaseCurrency) => {
        // gsBaseCurrency is undefined it means that its the first time we run the app
        // we will use the default currency USD
        let baseCurrency;
        if (gsBaseCurrency) {
          baseCurrency = gsBaseCurrency.value;
        } else {
          baseCurrency = Constants.DEFAULT_CURRENCY;
        }
        return dispatch(ratesLoaded(rates, baseCurrency));
      })
    ).catch(reject);
  });
}
function ratesLoaded(rates, baseCurrency) {
  logger.log('ratesLoaded');
  const payload = {};
  payload.rates = rates;
  payload.baseCurrency = baseCurrency;
  return {
    type: STATE_CURRENCY_RATES_LOADED,
    actionData: payload
  };
}
