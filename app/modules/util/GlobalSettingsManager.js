import { GlobalSettingsConstants } from 'amp-ui';
import Logger from './LoggerManager';
import * as Utils from '../../utils/Utils';

const logger = new Logger('Global settings manager');

const DEFAULT_GLOBAL_SETTINGS = {
  decimalSeparator: '.',
  groupSeparator: ',',
  format: '###.###',
  amountsInThousands: GlobalSettingsConstants.GS_AMOUNT_OPTION_IN_UNITS,
  dateFormat: 'DD/MM/YYYY'
};

/**
 * Global Settings Manager
 * @author Nadejda Mandrescu
 */
export default class GlobalSettingsManager {
  static _current = new GlobalSettingsManager(GlobalSettingsManager.buildGS(DEFAULT_GLOBAL_SETTINGS));

  static buildGS({ decimalSeparator, groupSeparator, format, amountsInThousands, dateFormat }) {
    const gsData = Utils.toMap(GlobalSettingsConstants.GS_DEFAULT_DECIMAL_SEPARATOR, decimalSeparator);
    gsData[GlobalSettingsConstants.GS_DEFAULT_GROUPING_SEPARATOR] = groupSeparator;
    gsData[GlobalSettingsConstants.GS_DEFAULT_NUMBER_FORMAT] = format;
    gsData[GlobalSettingsConstants.GS_AMOUNTS_IN_THOUSANDS] = amountsInThousands;
    gsData[GlobalSettingsConstants.DEFAULT_DATE_FORMAT] = dateFormat;
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
    logger.debug('getSettingByKey');
    return this._globalSettings && this._globalSettings[key];
  }
}
