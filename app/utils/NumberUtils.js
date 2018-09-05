/**
 * Created by Gabriel on 20/04/2017.
 */
import numeral from 'numeral';
import Logger from '../modules/util/LoggerManager';
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

require('./customNumeral');

const logger = new Logger('Number utils');

export default class NumberUtils {

  static createLanguage() {
    logger.log('buildLocale');
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
    logger.debug('rawNumberToFormattedString');
    const formatted = numeral(forceUnits ? number : NumberUtils.calculateInThousands(number))
      .format(GlobalSettingsManager.getSettingByKey(GS_DEFAULT_NUMBER_FORMAT));
    return formatted;
  }

  /**
   * Parses the number based on its formatted representation
   * @param formatted the formatted representation of the number
   * @return {number} the parsed number or NaN if value cannot be parsed based on the preconfigured format
   */
  static formattedStringToRawNumberOrNaN(formatted: string) {
    if (!numeral.validate(formatted)) {
      return Number.NaN;
    }
    return NumberUtils.formattedStringToRawNumber(formatted);
  }

  static formattedStringToRawNumber(numberString) {
    logger.debug('formattedStringToRawNumber');
    return numeral(numberString).value();
  }

  static calculateInThousands(number) {
    logger.debug('calculateInThousands');
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
    logger.debug('getAmountsInThousandsMessage');
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
