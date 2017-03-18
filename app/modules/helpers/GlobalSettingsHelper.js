import DatabaseManager from '../database/DatabaseManager';
import { COLLECTION_GLOBAL_SETTINGS } from '../../utils/Constants';
import { stringToId } from '../../utils/Utils';

const GlobalSettingsHelper = {

  saveGlobalSetting(settings) {
    console.log('saveOrUpdateGlobalSetting');
    // The normal structure of GS is {key|value} so we need to convert to {id|key|value}
    // for each element on settingsList.
    const newList = [];
    settings.forEach((key) => {
      const newItem = {};
      if (Object.prototype.hasOwnProperty.call(settings, key)) {
        newItem._key = key;
        newItem.value = settings[key];
        newItem.id = stringToId(newItem._key);
      }
      newList.push(newItem);
    });
    return DatabaseManager.saveOrUpdateCollection(newList, COLLECTION_GLOBAL_SETTINGS);
  }
};

module.exports = GlobalSettingsHelper;
