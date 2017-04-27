/**
 * Created by Anya on 24/04/2017.
 */
import LoggerManager from '../modules/util/LoggerManager';
import GlobalSettingsHelper from '../modules/helpers/GlobalSettingsHelper';
import store from '../index';
const moment = require('moment');

export default class DateUtils {

  static getConfigFromDB() {
    LoggerManager.log('getConfigFromDB');
    const data = {
      dateFormat: "DD/MM/YYYY"
    };
    
    return new Promise((resolve, reject) => (
      GlobalSettingsHelper.findByKey("Default Date Format")
      ).then( (db) => { 
      	if (db.length > 0) {
          data.dateFormat = db.value;
        }
      	return resolve(data);
      }).catch(reject)
    );
  }

  static createFormattedDate(date) {
    LoggerManager.log('createFormattedDate');
    let formattedDate = moment(date).isValid() ? moment(date).format(store.getState().startUp.gsDateData.dateFormat.toUpperCase()) : date;
    return formattedDate;
  }

}
