/**
 * Created by Anya on 24/04/2017.
 */
import Moment from 'moment';
import LoggerManager from '../modules/util/LoggerManager';
import GlobalSettingsHelper from '../modules/helpers/GlobalSettingsHelper';
import store from '../index';
import { API_DATE_FORMAT } from './Constants';
import { DEFAULT_DATE_FORMAT } from './constants/GlobalSettingsConstants';

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

  static formatDateForCurrencyRates(date) {
    return DateUtils.formatDate(date, API_DATE_FORMAT);
  }

  static isValidDateFormat(date, format) {
    const moment = Moment(date, format);
    return moment.isValid();
  }

  static formatDate(date, format) {
    const formattedDate = Moment(date).isValid() ?
      Moment(date).format(format) : date;
    return formattedDate;
  }
  
  static createFormattedDate(date) {
    LoggerManager.log('createFormattedDate');
    return DateUtils.formatDate(date, store.getState().startUpReducer.gsDateData.dateFormat.toUpperCase());
  }

  static duration(from, to) {
    // not using 'fromNow' since it doesn't provide exact difference
    let seconds = Moment(to).diff(from, 'seconds');
    const minutes = Math.floor(seconds / 60);
    seconds %= 60;
    return `${minutes} min ${seconds} sec`;
  }

}
