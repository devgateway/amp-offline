import store from '../index';
import SetupManager from '../modules/setup/SetupManager';
import TranslationManager from '../modules/util/TranslationManager';
import { SETUP_URL } from '../utils/Constants';
import * as URLUtils from '../utils/URLUtils';

const STATE_SETUP_STATUS = 'STATE_SETUP_STATUS';
export const STATE_SETUP_STATUS_PENDING = 'STATE_SETUP_STATUS_PENDING';
export const STATE_SETUP_STATUS_FULFILLED = 'STATE_SETUP_STATUS_FULFILLED';
export const STATE_SETUP_STATUS_REJECTED = 'STATE_SETUP_STATUS_REJECTED';
const STATE_SETUP_OPTIONS = 'STATE_SETUP_OPTIONS';
export const STATE_SETUP_OPTIONS_PENDING = 'STATE_SETUP_OPTIONS_PENDING';
export const STATE_SETUP_OPTIONS_FULFILLED = 'STATE_SETUP_OPTIONS_FULFILLED';
export const STATE_SETUP_OPTIONS_REJECTED = 'STATE_SETUP_OPTIONS_REJECTED';

export function checkIfSetupComplete() {
  // TODO update once AMPOFFLINE-692 is merged
  // const setupCompleteSettingPromise = ClientSettingsHelper.findSettingByName();
  const setupCompleteSettingPromise = Promise.resolve(false);
  store.dispatch({
    type: STATE_SETUP_STATUS,
    payload: setupCompleteSettingPromise
  });
  return setupCompleteSettingPromise;
}

export function doSetupFirst() {
  if (!didSetupComplete()) {
    URLUtils.forwardTo(SETUP_URL);
  }
}

export function didSetupComplete() {
  return store.getState().setupReducer.isSetupComplete;
}

export function setupComplete(/* settings */) {
  // TODO save the settings once AMPOFFLINE-692 is merged
  // TODO prepare settings
  // const saveSetupSettingsPromise = ClientSettingsHelper.saveOrUpdateSetting(settings).then(() => true);
  const saveSetupSettingsPromise = Promise.resolve(true)
    .then((result) => {
      // cleanup temporary setup translations
      TranslationManager.removeAllTranslationFiles();
      return result;
    });
  return (dispatch) => dispatch({
    type: STATE_SETUP_STATUS,
    payload: saveSetupSettingsPromise
  });
}

export function loadSetupOptions() {
  return (dispatch) => dispatch({
    type: STATE_SETUP_OPTIONS,
    payload: SetupManager.getSetupOptions()
  });
}
