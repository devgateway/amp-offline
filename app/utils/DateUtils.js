/**
 * Created by Anya on 24/04/2017.
 */
import LoggerManager from '../modules/util/LoggerManager';
import GlobalSettingsHelper from '../modules/helpers/GlobalSettingsHelper';
import store from '../index';

export default class DateUtils {

  static getConfigFromDB() {
    LoggerManager.log('getConfigFromDB');
    const data = {
      dateFormat: "DD/MM/YYYY"
    };
    
    return new Promise((resolve, reject) => (
      GlobalSettingsHelper.findByKey("Default Date Format")
      ).then( (db) => { 
      	return resolve(db.value);
      }).catch(reject)
    );
  }

  static createFormattedDate(date) {
    LoggerManager.log('createFormattedDate');
    return numeral(NumberUtils.calculateInThousands(number)).format(store.getState().startUp.gsNumberData.format);
  }

}
