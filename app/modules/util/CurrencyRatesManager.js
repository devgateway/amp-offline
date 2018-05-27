/* eslint-disable class-methods-use-this */
import { CURRENCY_HOUR, CURRENCY_PAIR, RATE_SAME_CURRENCY } from '../../utils/Constants';
import translate from '../../utils/translate';
import { NOTIFICATION_ORIGIN_CURRENCY_MANAGER, RATE_CURRENCY_NOT_FOUND } from '../../utils/constants/ErrorConstants';
import ErrorNotificationHelper from '../../modules/helpers/ErrorNotificationHelper';
import { formatDateForCurrencyRates } from '../../utils/DateUtils';
import * as AC from '../../utils/constants/ActivityConstants';

export default class CurrencyRatesManager {
  constructor(currencyRates, baseCurrency) {
    this._currencyRates = currencyRates;
    this._baseCurrency = baseCurrency;
  }

  /**
   * Currency conversion utility. If we have the direct rate it will convert from currencyFrom to currencyTo in the
   * given date. If we don't have the said currency it will try to search the inverse rate and use 1/x. If the inverse
   * rate is also not Available an error will be thrown
   * @param currencyFrom currency code from the currency we are converting from
   * @param currencyTo currency code from the currency we are converting to
   * @param dateToFind date for which we are doing the conversion. It is expected in yyyy-mm-dd
   * @returns {*|Promise.<TResult>}
   */
  convertCurrency(currencyFrom, currencyTo, dateToFind, fixedExchangeRate) {
    if (currencyFrom === currencyTo) {
      return RATE_SAME_CURRENCY;
    }
    if (fixedExchangeRate && fixedExchangeRate > 0) {
      return (this.convertCurrency(this._baseCurrency, currencyTo, dateToFind, null) / fixedExchangeRate);
    }
    const timeDateToFind = (new Date(`${dateToFind} ${CURRENCY_HOUR}`)).getTime();
    if (this._currencyRates) {
      const currenciesToSearchDirect = this._currencyRates.find((item) =>
        item[CURRENCY_PAIR].from === currencyFrom && item[CURRENCY_PAIR].to === currencyTo
      );
      if (currenciesToSearchDirect) {
        return this.getExchangeRate(currenciesToSearchDirect, timeDateToFind);
      } else {
        // direct not found
        const currenciesToSearchInverse =
          this._currencyRates.find((item) =>
            item[CURRENCY_PAIR].from === currencyTo && item[CURRENCY_PAIR].to === currencyFrom
          );
        if (currenciesToSearchInverse) {
          return 1 / this.getExchangeRate(currenciesToSearchInverse, timeDateToFind);
        } else {
          return this.convertViaBaseCurrency(currencyFrom, currencyTo, timeDateToFind);
        }
      }
    } else {
      throw this._getCurrencyError('CurrencyRatesNotInitialized');
    }
  }

  convertFundingDetailsToCurrency(fundingDetails, currencyTo) {
    let total = 0;
    fundingDetails.forEach(fd => {
      total += this.convertTransactionAmountToCurrency(fd, currencyTo);
    });

    return total;
  }

  convertTransactionAmountToBaseCurrency(fundingDetail) {
    return this.convertTransactionAmountToCurrency(fundingDetail, this._baseCurrency);
  }

  convertTransactionAmountToCurrency(fundingDetail, currencyTo) {
    const fixedExchangeRate = fundingDetail[AC.FIXED_EXCHANGE_RATE];
    const currencyFrom = fundingDetail[AC.CURRENCY].value;
    const transactionDate = formatDateForCurrencyRates(fundingDetail[AC.TRANSACTION_DATE]);
    const transactionAmount = fundingDetail[AC.TRANSACTION_AMOUNT];
    const currencyRate = this.convertCurrency(currencyFrom, currencyTo, transactionDate, fixedExchangeRate);
    return transactionAmount * currencyRate;
  }

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

  _getCurrencyError(errorMesage) {
    const notifErrorCurrency = ErrorNotificationHelper.createNotification({
      message: translate(errorMesage),
      origin: NOTIFICATION_ORIGIN_CURRENCY_MANAGER
    });
    return notifErrorCurrency;
  }

  convertViaBaseCurrency(currencyFrom, currencyTo, timeDateToFind) {
    const rateFromToBase = this._currencyRates.find((item) =>
      item[CURRENCY_PAIR].from === currencyFrom && item[CURRENCY_PAIR].to === this._baseCurrency
    );
    const rateBaseToTo = this._currencyRates.find((item) =>
      item[CURRENCY_PAIR].from === this._baseCurrency && item[CURRENCY_PAIR].to === currencyTo
    );
    if (rateFromToBase && rateBaseToTo) {
      // if we have both currencies we just return the product of ech rate
      return this.getExchangeRate(rateFromToBase, timeDateToFind) * this.getExchangeRate(rateBaseToTo, timeDateToFind);
    } else if (rateFromToBase) {
      // if either of them is not found we try to find the inverse
      // we get the inverse of rateBaseToTo
      const rateToToBase = this._currencyRates.find((item) =>
        item[CURRENCY_PAIR].from === currencyTo && item[CURRENCY_PAIR].to === this._baseCurrency
      );
      if (rateToToBase) {
        return this.getExchangeRate(rateFromToBase, timeDateToFind)
          * (1 / this.getExchangeRate(rateToToBase, timeDateToFind));
      } else {
        return RATE_CURRENCY_NOT_FOUND;
      }
    } else if (rateBaseToTo) {
      const rateBaseToFrom = this._currencyRates.find((item) =>
        item[CURRENCY_PAIR].from === this._baseCurrency && item[CURRENCY_PAIR].to === currencyFrom
      );
      // we try to get the inverse of rateFromToBase
      if (rateBaseToFrom) {
        return (1 / this.getExchangeRate(rateBaseToFrom, timeDateToFind))
          * this.getExchangeRate(rateBaseToTo, timeDateToFind);
      } else {
        return RATE_CURRENCY_NOT_FOUND;
      }
    } else {
      return RATE_CURRENCY_NOT_FOUND;
    }
  }
}
