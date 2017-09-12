/**
 * Created by Gabriel on 20/04/2017.
 */
import numeral from 'numeral';
import LoggerManager from '../modules/util/LoggerManager';
import GlobalSettingsHelper from '../modules/helpers/GlobalSettingsHelper';
import {
  GS_DEFAULT_DECIMAL_SEPARATOR,
  GS_AMOUNTS_IN_THOUSANDS,
  GS_DEFAULT_GROUPING_SEPARATOR,
  GS_DEFAULT_NUMBER_FORMAT,
  GS_AMOUNT_OPTION_IN_UNITS,
  GS_AMOUNT_OPTION_IN_THOUSANDS,
  GS_AMOUNT_OPTION_IN_MILLIONS,
  GS_AMOUNT_OPTION_IN_BILLIONS
} from './constants/GlobalSettingsConstants';
import store from '../index';
import Utils from './Utils';
import translate from './translate';

export default class NumberUtils {

  static getConfigFromDB() {
    LoggerManager.log('getConfigFromDB');
    const data = {
      decimalSeparator: '.',
      groupSeparator: ',',
      format: '###.###',
      amountsInThousands: GS_AMOUNT_OPTION_IN_UNITS
    };
    return new Promise((resolve, reject) => (
      GlobalSettingsHelper.findAll({
        key: {
          $in: [GS_DEFAULT_DECIMAL_SEPARATOR,
            GS_DEFAULT_GROUPING_SEPARATOR,
            GS_DEFAULT_NUMBER_FORMAT,
            GS_AMOUNTS_IN_THOUSANDS]
        }
      }).then((db) => {
        if (db.length > 0) {
          data.decimalSeparator = db.find((item) => (item.key === GS_DEFAULT_DECIMAL_SEPARATOR)).value;
          data.groupSeparator = db.find((item) => (item.key === GS_DEFAULT_GROUPING_SEPARATOR)).value;
          data.format = db.find((item) => (item.key === GS_DEFAULT_NUMBER_FORMAT)).value;
          data.amountsInThousands = db.find((item) => (item.key === GS_AMOUNTS_IN_THOUSANDS)).value;
        }
        return resolve(data);
      }).catch(reject)
    ));
  }

  static createLanguage() {
    LoggerManager.log('buildLocale');
    const data = store.getState().startUpReducer.gsNumberData;
    const localeName = `locale_${Utils.stringToUniqueId('')}`;
    numeral.register('locale', localeName, {
      delimiters: {
        thousands: data.groupSeparator,
        decimal: data.decimalSeparator
      },
      abbreviations: {
        thousand: 'k',
        million: 'm',
        billion: 'b',
        trillion: 't'
      },
      ordinal: (number) => {
        switch (number) {
          case 1:
            return 'st';
          case 2:
            return 'nd';
          case 3:
            return 'rd';
          default:
            return 'th';
        }
      },
      currency: {
        symbol: '$'
      }
    });
    // switch between locales
    numeral.locale(localeName);
  }

  static rawNumberToFormattedString(number, forceUnits = false) {
    LoggerManager.log('rawNumberToFormattedString');
    const formatted = numeral(forceUnits ? number : NumberUtils.calculateInThousands(number))
      .format(store.getState().startUpReducer.gsNumberData.format);
    return formatted;
  }

  static formattedStringToRawNumber(numberString) {
    LoggerManager.debug('formattedStringToRawNumber');
    return numeral(numberString).value();
  }

  static calculateInThousands(number) {
    LoggerManager.log('calculateInThousands');
    switch (store.getState().startUpReducer.gsNumberData.amountsInThousands) {
      case GS_AMOUNT_OPTION_IN_UNITS:
        return number;
      case GS_AMOUNT_OPTION_IN_THOUSANDS:
        return number / 1000;
      case GS_AMOUNT_OPTION_IN_MILLIONS:
        return number / 1000 / 1000;
      case GS_AMOUNT_OPTION_IN_BILLIONS:
        return number / 1000 / 1000 / 1000;
      default:
        return number;
    }
  }

  static getAmountsInThousandsMessage() {
    LoggerManager.log('getAmountsInThousandsMessage');
    switch (store.getState().startUpReducer.gsNumberData.amountsInThousands) {
      case GS_AMOUNT_OPTION_IN_UNITS:
        return translate('Amounts in Units');
      case GS_AMOUNT_OPTION_IN_THOUSANDS:
        return translate('Amounts in Thousands (000)');
      case GS_AMOUNT_OPTION_IN_MILLIONS:
        return translate('Amounts in Millions (000 000)');
      case GS_AMOUNT_OPTION_IN_BILLIONS:
        return translate('Amounts in Billions (000 000 000)');
      default:
        return '';
    }
  }
}
