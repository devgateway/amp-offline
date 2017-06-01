import CurrencyRatesHelper from '../../modules/helpers/CurrencyRatesHelper';
import { CURRENCY_HOUR } from '../../utils/Constants';
import translate from '../../utils/translate';
import { NOTIFICATION_ORIGIN_CURRENCY_MANAGER } from '../../utils/constants/ErrorConstants';
import ErrorNotificationHelper from '../../modules/helpers/ErrorNotificationHelper';

const CurrencyRatesManager = {
  convertCurrency(currencyFrom, currencyTo, dateToFind) {
    const timeDateToFind = (new Date(`${dateToFind} ${CURRENCY_HOUR}`)).getTime();
    return CurrencyRatesHelper.findByFromAndTo(currencyFrom, currencyTo).then((currenciesToSearchDirect) => {
      if (currenciesToSearchDirect) {
        // we found the direct convesion
        return new Promise((resolve) => {
          resolve(this.getExchangeRate(currenciesToSearchDirect, timeDateToFind));
        });
      } else {
        // we go to fetch the inverse
        return CurrencyRatesHelper.findByFromAndTo(currencyTo, currencyFrom).then(currenciesToSearchInverse =>
          new Promise((resolve, reject) => {
            if (currenciesToSearchInverse) {
              resolve(1 / this.getExchangeRate(currenciesToSearchInverse, timeDateToFind));
            } else {
              const notifErrorNoCurrency = ErrorNotificationHelper.createNotification({
                message: translate('timeoutError'),
                origin: NOTIFICATION_ORIGIN_CURRENCY_MANAGER
              });
              reject(notifErrorNoCurrency);
            }
          })
        );
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
