/**
 * Created by Anya on 24/04/2017.
 */
import Moment from 'moment';
import Logger from '../modules/util/LoggerManager';
import { API_LONG_DATE_FORMAT, API_SHORT_DATE_FORMAT } from '../modules/connectivity/AmpApiConstants';
import { DEFAULT_DATE_FORMAT } from './constants/GlobalSettingsConstants';
import GlobalSettingsManager from '../modules/util/GlobalSettingsManager';
import * as ErrorNotificationHelper from '../modules/helpers/ErrorNotificationHelper';
import { NOTIFICATION_ORIGIN_DATES } from './constants/ErrorConstants';
import translate from '../utils/translate';

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
    return DateUtils.formatDate(date, API_SHORT_DATE_FORMAT);
  }

  static isValidDateFormat(date, format) {
    const moment = Moment(date, format);
    return moment.isValid();
  }

  static formatDate(date, format) {
    if (date) {
      const dateAsMoment = Moment(date);
      if (dateAsMoment.isValid()) {
        return dateAsMoment.format(format);
      }
      const message = `${translate('Invalid date provided')}: ${date}`;
      logger.error(message);
      throw ErrorNotificationHelper.createNotification({ message, origin: NOTIFICATION_ORIGIN_DATES });
    }
    return '';
  }

  static getGSDateFormat() {
    return GlobalSettingsManager.getSettingByKey(DEFAULT_DATE_FORMAT).toUpperCase();
  }

  static getDateTimeFormat() {
    const dateFormat = this.getGSDateFormat();
    return `${dateFormat} H:mm:ss`;
  }

  static createFormattedDate(date) {
    logger.debug('createFormattedDate');
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
   * Formats the date according to AMP API format
   * @param date (optional, defaults to current moment)
   * @returns {string} date formatted according to API format
   */
  static getISODateForAPI(date = new Date()) {
    // DO NOT remove the timezone, since AMP also stores it.
    // We'll revise, if needed, once we implement the timing synchronization between AMP and AMP Offline client.
    return DateUtils.formatDate(date, API_LONG_DATE_FORMAT);
  }
}
