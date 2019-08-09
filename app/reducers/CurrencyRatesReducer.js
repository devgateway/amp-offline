import { CurrencyRatesManager } from 'amp-ui';
import { STATE_LOADING_CURRENCY_RATES, STATE_CURRENCY_RATES_LOADED } from '../actions/CurrencyRatesAction';
import Logger from '../modules/util/LoggerManager';
import translate from '../utils/translate';
import DateUtils from '../utils/DateUtils';
import * as ErrorNotificationHelper from '../modules/helpers/ErrorNotificationHelper';

const logger = new Logger('Currency rates reducer');

const defaultState = {
  currencyRatesManager: undefined,
  loadingCurrencyRates: false
};

export default function currencyRatesReducer(state: Object = defaultState, action: Object) {
  logger.debug('currencyRatesReducer');
  switch (action.type) {
    case STATE_LOADING_CURRENCY_RATES:
      return Object.assign({}, state, {
        loadingCurrencyRates: true
      });
    case STATE_CURRENCY_RATES_LOADED: {
      const currencyRatesManager = new CurrencyRatesManager(action.actionData.rates, action.actionData.baseCurrency,
        translate, DateUtils,
        ErrorNotificationHelper);
      return Object.assign({}, state, {
        currencyRatesManager,
        loadingCurrencyRates: false
      });
    }
    default:
      return state;
  }
}
