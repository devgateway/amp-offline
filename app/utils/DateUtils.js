/**
 * Created by Anya on 24/04/2017.
 */
import Moment from 'moment';
import LoggerManager from '../modules/util/LoggerManager';
import GlobalSettingsHelper from '../modules/helpers/GlobalSettingsHelper';
import store from '../index';
import { DEFAULT_DATE_FORMAT } from './constants/GlobalSettingsConstants';
import { CURRENCY_DATE_FORMAT } from './Constants';

export default class DateUtils {

  static getConfigFromDB() {
    LoggerManager.log('getConfigFromDB');
    const data = {
      dateFormat: 'DD/MM/YYYY'
    };

    return new Promise((resolve, reject) => (
      GlobalSettingsHelper.findByKey(DEFAULT_DATE_FORMAT))
      .then((dbDateFormat) => {
        if (dbDateFormat != null) {
          data.dateFormat = dbDateFormat.value;
        }
        return resolve(data);
      }).catch(reject)
    );
  }

  static formatDate(date, format) {
    LoggerManager.log('createFormattedDate');
    return Moment(date).isValid() ? Moment(date).format(format) : date;
  }

  static createFormattedDate(date) {
    return DateUtils.formatDate(date, store.getState().startUpReducer.gsDateData.dateFormat.toUpperCase());
  }

  static formatDateForCurrencyRates(date) {
    return DateUtils.formatDate(date, CURRENCY_DATE_FORMAT);
  }

  static duration(from, to) {
    // not using 'fromNow' since it doesn't provide exact difference
    let seconds = Moment(to).diff(from, 'seconds');
    const minutes = Math.floor(seconds / 60);
    seconds %= 60;
    return `${minutes} min ${seconds} sec`;
  }

}
