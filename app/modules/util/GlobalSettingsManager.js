import LoggerManager from './LoggerManager';
import {
  DEFAULT_DATE_FORMAT,
  GS_AMOUNT_OPTION_IN_UNITS, GS_AMOUNTS_IN_THOUSANDS, GS_DEFAULT_DECIMAL_SEPARATOR, GS_DEFAULT_GROUPING_SEPARATOR,
  GS_DEFAULT_NUMBER_FORMAT
} from '../../utils/constants/GlobalSettingsConstants';
import * as Utils from '../../utils/Utils';

const DEFAULT_GLOBAL_SETTINGS = {
  decimalSeparator: '.',
  groupSeparator: ',',
  format: '###.###',
  amountsInThousands: GS_AMOUNT_OPTION_IN_UNITS,
  dateFormat: 'DD/MM/YYYY'
};

/**
 * Global Settings Manager
 * @author Nadejda Mandrescu
 */
export default class GlobalSettingsManager {
  static _current = new GlobalSettingsManager(GlobalSettingsManager.buildGS(DEFAULT_GLOBAL_SETTINGS));

  static buildGS({ decimalSeparator, groupSeparator, format, amountsInThousands, dateFormat }) {
    const gsData = Utils.toMap(GS_DEFAULT_DECIMAL_SEPARATOR, decimalSeparator);
    gsData[GS_DEFAULT_GROUPING_SEPARATOR] = groupSeparator;
    gsData[GS_DEFAULT_NUMBER_FORMAT] = format;
    gsData[GS_AMOUNTS_IN_THOUSANDS] = amountsInThousands;
    gsData[DEFAULT_DATE_FORMAT] = dateFormat;
    return gsData;
  }

  constructor(globalSettings) {
    this._globalSettings = globalSettings;
  }

  set globalSettings(globalSettings) {
    this._globalSettings = globalSettings;
  }

  static setGlobalSettings(globalSettings) {
    this._current.globalSettings = globalSettings;
  }

  /**
   * Retrieves a global setting value by key
   * @param key the GS key
   * @return {String} raw value
   */
  static getSettingByKey(key) {
    return this._current.getSettingByKey(key);
  }

  getSettingByKey(key) {
    LoggerManager.debug('getSettingByKey');
    return this._globalSettings && this._globalSettings[key];
  }
}
