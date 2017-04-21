/**
 * Created by Gabriel on 20/04/2017.
 */
import Numeral from 'numeral';
import LoggerManager from '../modules/util/LoggerManager';
import GlobalSettingsHelper from '../modules/helpers/GlobalSettingsHelper';
import {
  GS_DEFAULT_DECIMAL_SEPARATOR,
  GS_AMOUNTS_IN_THOUSANDS,
  GS_DEFAULT_GROUPING_SEPARATOR,
  GS_DEFAULT_NUMBER_FORMAT
} from './constants/GlobalSettingConstants';
import store from '../index';

export default class NumberUtils {

  static getConfigFromDB() {
    LoggerManager.log('getConfigFromDB');
    const data = { decimalSeparator: '', groupSeparator: '', format: '', amountsInThousands: '' };
    return new Promise((resolve, reject) => (
      GlobalSettingsHelper.findAll({
        key: {
          $in: [GS_DEFAULT_DECIMAL_SEPARATOR,
            GS_DEFAULT_GROUPING_SEPARATOR,
            GS_DEFAULT_NUMBER_FORMAT,
            GS_AMOUNTS_IN_THOUSANDS]
        }
      }).then((db) => {
        data.decimalSeparator = db.find((item) => (item.key === GS_DEFAULT_DECIMAL_SEPARATOR)).value;
        data.groupSeparator = db.find((item) => (item.key === GS_DEFAULT_GROUPING_SEPARATOR)).value;
        data.format = db.find((item) => (item.key === GS_DEFAULT_NUMBER_FORMAT)).value;
        data.amountsInThousands = db.find((item) => (item.key === GS_AMOUNTS_IN_THOUSANDS)).value;
        return resolve(data);
      }).catch(reject)
    ));
  }

  static rawNumberToFormattedString(number) {
    LoggerManager.log('rawNumberToFormattedString');
    if (store.getState().startUp.gsNumberData) {
      // todo: format number.
    }
    return number;
  }
}
