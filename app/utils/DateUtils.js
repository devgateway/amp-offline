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
    /* NOTE: Depending on the country where the app is ran the timezone part of the string (ie: +0000) can cause the
    * formatted date to be +1/-1 days, so we remove it from the string with a regex. */
    if (date) {
      date = date.replace(/[+|-][0-9]{4}/g, '');
    }
    const formattedDate = Moment(date).isValid() ?
      Moment(date).format(format) : date;
    return formattedDate;
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

  static duration(from, to) {
    // not using 'fromNow' since it doesn't provide exact difference
    let seconds = Moment(to).diff(from, 'seconds');
    const minutes = Math.floor(seconds / 60);
    seconds %= 60;
    return `${minutes} min ${seconds} sec`;
  }

}
