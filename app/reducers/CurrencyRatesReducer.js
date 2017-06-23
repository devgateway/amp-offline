import { STATE_LOADING_CURRENCY_RATES, STATE_CURRENCY_RATES_LOADED } from '../actions/CurrencyRatesAction';
import CurrencyRatesManager from '../modules/util/CurrencyRatesManager';
import LoggerManager from '../modules/util/LoggerManager';

const defaultState = {
  currencyRatesManager: undefined,
  loadingCurrencyRates: false
};

export default function currencyRatesReducer(state: Object = defaultState, action: Object) {
  LoggerManager.log('currencyRatesReducer');
  switch (action.type) {
    case STATE_LOADING_CURRENCY_RATES:
      return Object.assign({}, state, {
        loadingCurrencyRates: true
      });
    case STATE_CURRENCY_RATES_LOADED: {
      const currencyRatesManager = new CurrencyRatesManager(action.actionData.rates,
        action.actionData.baseCurrency);
      return Object.assign({}, state, {
        currencyRatesManager,
        loadingCurrencyRates: false
      });
    }
    default:
      return state;
  }
}
