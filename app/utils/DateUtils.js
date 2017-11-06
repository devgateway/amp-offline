/**
 * Created by Anya on 24/04/2017.
 */
import Moment from 'moment';
import Logger from '../modules/util/LoggerManager';
import { API_DATE_FORMAT } from './Constants';
import { DEFAULT_DATE_FORMAT } from './constants/GlobalSettingsConstants';
import GlobalSettingsManager from '../modules/util/GlobalSettingsManager';

const logger = new Logger('Date utils');

export default class DateUtils {
  /**
   * Configures the global locale to be used by the Moment library, e.g. in the Date Picker
   * @param lang
   */
  static setCurrentLang(lang) {
    Moment.locale(lang);
  }

  static formatDateForCurrencyRates(date) {
    return DateUtils.formatDate(date, API_DATE_FORMAT);
  }

  static isValidDateFormat(date, format) {
    const moment = Moment(date, format);
    return moment.isValid();
  }

  static formatDate(date, format) {
    if (date !== undefined && date !== null) {
      const formattedDate = Moment(date).isValid() ? Moment(date).format(format) : date;
      return formattedDate;
    } else {
      // otherwise undefined date is converted to today.
      return '';
    }
  }

  static getGSDateFormat() {
    return GlobalSettingsManager.getSettingByKey(DEFAULT_DATE_FORMAT).toUpperCase();
  }

  static getDateTimeFormat() {
    const dateFormat = this.getGSDateFormat();
    return `${dateFormat} H:mm:ss`;
  }

  static createFormattedDate(date) {
    logger.log('createFormattedDate');
    return DateUtils.formatDate(date, DateUtils.getGSDateFormat());
  }

  static createFormattedDateTime(date) {
    return DateUtils.formatDate(date, DateUtils.getDateTimeFormat());
  }

  /**
   * Gets a date from future or past relative to the current moment
   * @param durationStr the duration to add/substract from the current moment
   * @param isAdd if true, then adds the duration (default to false)
   * @return {moment.Moment}
   */
  static getDateFromNow(durationStr: string, isAdd = false) {
    const duration = Moment.duration(durationStr);
    if (Moment.isDuration(duration)) {
      if (isAdd) {
        return Moment().add(duration);
      }
      return Moment().subtract(duration);
    }
    const error = `Invalid duration format: ${durationStr}`;
    logger.error(error);
    throw new Error(error);
  }

  static duration(from, to) {
    // not using 'fromNow' since it doesn't provide exact difference
    let seconds = Moment(to).diff(from, 'seconds');
    const minutes = Math.floor(seconds / 60);
    seconds %= 60;
    return `${minutes} min ${seconds} sec`;
  }

  /**
   * Remove the 'Z' and add +0000 (not +00:00) to match API validation.
   * @param date
   * @returns {string}
   */
  static getISODateForAPI(date) {
    date = date || new Date();
    return `${date.toISOString().substring(0, date.toISOString().length - 1)}+0000`;
  }
}
