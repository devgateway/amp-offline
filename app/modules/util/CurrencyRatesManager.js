import CurrencyRatesHelper from '../../modules/helpers/CurrencyRatesHelper';
import { CURRENCY_HOUR } from '../../utils/Constants';
import translate from '../../utils/translate';
import { NOTIFICATION_ORIGIN_CURRENCY_MANAGER } from '../../utils/constants/ErrorConstants';
import ErrorNotificationHelper from '../../modules/helpers/ErrorNotificationHelper';

const CurrencyRatesManager = {
  /**
   * Currency conversion utility. If we have the direct rate it will convert from currencyFrom to currencyTo in the
   * given date. If we don't have the said currency it will try to search the inverse rate and use 1/x. If the inverse
   * rate is also not Available an error will be thrown
   * @param currencyFrom currency code from the currency we are converting from
   * @param currencyTo currency code from the currency we are converting to
   * @param dateToFind date for which we are doing the conversion. It is expected in yyyy-mm-dd
   * @returns {*|Promise.<TResult>}
   */
  convertCurrency(currencyFrom, currencyTo, dateToFind) {
    const timeDateToFind = (new Date(`${dateToFind} ${CURRENCY_HOUR}`)).getTime();
    return CurrencyRatesHelper.findByFromAndTo(currencyFrom, currencyTo).then((currenciesToSearchDirect) => {
      if (currenciesToSearchDirect) {
        return this.getExchangeRate(currenciesToSearchDirect, timeDateToFind);
      } else {
        return CurrencyRatesHelper.findByFromAndTo(currencyTo, currencyFrom).then((currenciesToSearchInverse) => {
          if (currenciesToSearchInverse) {
            return 1 / this.getExchangeRate(currenciesToSearchInverse, timeDateToFind);
          } else {
            const notifErrorNoCurrency = ErrorNotificationHelper.createNotification({
              message: translate('Currency rate not found'),
              origin: NOTIFICATION_ORIGIN_CURRENCY_MANAGER
            });
            return Promise.reject(notifErrorNoCurrency);
          }
        });
      }
    });
  },
  getExchangeRate(currenciesToSearch, timeDateToFind) {
    let lowerEnd = 0;
    let higherEnd = currenciesToSearch.rates.length - 1;
    while (lowerEnd < higherEnd) {
      const middle = Math.floor((lowerEnd + higherEnd) / 2);
      const difference = Math.abs((new Date(`${currenciesToSearch.rates[middle].date}  ${CURRENCY_HOUR}`))
        - timeDateToFind);
      const difference1 = Math.abs((new Date(`${currenciesToSearch.rates[middle + 1].date}  ${CURRENCY_HOUR}`))
        - timeDateToFind);
      if (difference1 <= difference) {
        lowerEnd = middle + 1;
      } else {
        higherEnd = middle;
      }
    }
    return currenciesToSearch.rates[higherEnd].rate;
  }
};
export default CurrencyRatesManager;
