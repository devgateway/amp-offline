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
} from './constants/GlobalSettingConstants';
import store from '../index';

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
    const data = store.getState().startUp.gsNumberData;
    const localeName = `locale_${Math.random() * 100}`.substring(0, 9);
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
            return 'trd';
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

  static rawNumberToFormattedString(number) {
    LoggerManager.log('rawNumberToFormattedString');
    return numeral(NumberUtils.calculateInThousands(number)).format(store.getState().startUp.gsNumberData.format);
  }

  static calculateInThousands(number) {
    LoggerManager.log('calculateInThousands');
    switch (store.getState().startUp.gsNumberData.amountsInThousands) {
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
}
