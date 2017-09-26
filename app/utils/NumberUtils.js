/**
 * Created by Gabriel on 20/04/2017.
 */
import numeral from 'numeral';
import LoggerManager from '../modules/util/LoggerManager';
import {
  GS_AMOUNT_OPTION_IN_BILLIONS,
  GS_AMOUNT_OPTION_IN_MILLIONS,
  GS_AMOUNT_OPTION_IN_THOUSANDS,
  GS_AMOUNT_OPTION_IN_UNITS,
  GS_AMOUNTS_IN_THOUSANDS,
  GS_DEFAULT_DECIMAL_SEPARATOR,
  GS_DEFAULT_GROUPING_SEPARATOR,
  GS_DEFAULT_NUMBER_FORMAT
} from './constants/GlobalSettingsConstants';
import Utils from './Utils';
import translate from './translate';
import GlobalSettingsManager from '../modules/util/GlobalSettingsManager';

export default class NumberUtils {

  static createLanguage() {
    LoggerManager.log('buildLocale');
    const localeName = `locale_${Utils.stringToUniqueId('')}`;
    numeral.register('locale', localeName, {
      delimiters: {
        thousands: GlobalSettingsManager.getSettingByKey(GS_DEFAULT_GROUPING_SEPARATOR),
        decimal: GlobalSettingsManager.getSettingByKey(GS_DEFAULT_DECIMAL_SEPARATOR)
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
      .format(GlobalSettingsManager.getSettingByKey(GS_DEFAULT_NUMBER_FORMAT));
    return formatted;
  }

  static formattedStringToRawNumber(numberString) {
    LoggerManager.debug('formattedStringToRawNumber');
    return numeral(numberString).value();
  }

  static calculateInThousands(number) {
    LoggerManager.log('calculateInThousands');
    switch (GlobalSettingsManager.getSettingByKey(GS_AMOUNTS_IN_THOUSANDS)) {
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
    switch (GlobalSettingsManager.getSettingByKey(GS_AMOUNTS_IN_THOUSANDS)) {
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
