import store from '../index';
import SetupManager from '../modules/setup/SetupManager';
import { LANGUAGE_ENGLISH, SETUP_URL } from '../utils/Constants';
import * as URLUtils from '../utils/URLUtils';
import LoggerManager from '../modules/util/LoggerManager';
import { connectivityCheck } from './ConnectivityAction';
import translate from '../utils/translate';
import ConnectionInformation from '../modules/connectivity/ConnectionInformation';

const STATE_SETUP_STATUS = 'STATE_SETUP_STATUS';
export const STATE_SETUP_STATUS_PENDING = 'STATE_SETUP_STATUS_PENDING';
export const STATE_SETUP_STATUS_FULFILLED = 'STATE_SETUP_STATUS_FULFILLED';
export const STATE_SETUP_STATUS_REJECTED = 'STATE_SETUP_STATUS_REJECTED';
const STATE_SETUP_OPTIONS = 'STATE_SETUP_OPTIONS';
export const STATE_SETUP_OPTIONS_PENDING = 'STATE_SETUP_OPTIONS_PENDING';
export const STATE_SETUP_OPTIONS_FULFILLED = 'STATE_SETUP_OPTIONS_FULFILLED';
export const STATE_SETUP_OPTIONS_REJECTED = 'STATE_SETUP_OPTIONS_REJECTED';
const STATE_SETUP_DEFAULTS = 'STATE_SETUP_DEFAULTS';
export const STATE_SETUP_DEFAULTS_PENDING = 'STATE_SETUP_DEFAULTS_PENDING';
export const STATE_SETUP_DEFAULTS_FULFILLED = 'STATE_SETUP_DEFAULTS_FULFILLED';
export const STATE_SETUP_DEFAULTS_REJECTED = 'STATE_SETUP_DEFAULTS_REJECTED';


export const STATE_PARAMETERS_LOADED = 'STATE_PARAMETERS_LOADED';
export const STATE_PARAMETERS_LOADING = 'STATE_PARAMETERS_LOADING';

export function checkIfSetupComplete() {
  const setupCompleteSettingPromise = SetupManager.didSetupComplete();
  store.dispatch({
    type: STATE_SETUP_STATUS,
    payload: setupCompleteSettingPromise
  });
  return setupCompleteSettingPromise;
}

export function doSetupFirst() {
  const isSetupComplete = didSetupComplete();
  const defaultsPromise = configureDefaults(isSetupComplete);
  if (!isSetupComplete) {
    URLUtils.forwardTo(SETUP_URL);
  }
  return defaultsPromise;
}

export function didSetupComplete() {
  const { setupReducer, loginReducer } = store.getState();
  // setup state is not yet reinitialized due to logout reset, however logging out means setup step was completed
  return setupReducer.isSetupComplete || loginReducer.logoutConfirmed;
}

export function configureDefaults(isSetupComplete) {
  LoggerManager.log(`configureDefaults with isSetupComplete=${isSetupComplete}`);
  const setupDefaultsPromise = SetupManager.setDefaults(isSetupComplete);
  store.dispatch({
    type: STATE_SETUP_DEFAULTS,
    payload: setupDefaultsPromise
  });
  return setupDefaultsPromise;
}

export function loadConnectionInformation() {
  LoggerManager.log('loadConnectionInformation');
  store.dispatch({ type: STATE_PARAMETERS_LOADING });
  return SetupManager.getConnectionInformation()
    .then(configureOnLoad);
}

function configureOnLoad(connectionInformation: ConnectionInformation) {
  const isTestingEnv = +process.env.USE_TEST_AMP_URL;
  if (isTestingEnv && !didSetupComplete()) {
    const customOption = SetupManager.getCustomOption([LANGUAGE_ENGLISH]);
    customOption.urls = [connectionInformation.getFullUrl()];
    return store.dispatch(setupComplete(customOption));
  } else {
    configureConnectionInformation(connectionInformation);
  }
}

export function configureConnectionInformation(connectionInformation) {
  store.dispatch({
    type: STATE_PARAMETERS_LOADED,
    actionData: { connectionInformation }
  });
  return connectionInformation;
}

export function setupComplete(setupConfig) {
  const saveSetupSettingsPromise = testConnectivity(setupConfig)
    .then(() => SetupManager.saveSetupAndCleanup(setupConfig))
    .then(() => true);
  return (dispatch) => dispatch({
    type: STATE_SETUP_STATUS,
    payload: saveSetupSettingsPromise
  });
}

function testConnectivity(setupConfig) {
  const hasUrls = setupConfig && setupConfig.urls && setupConfig.urls.length;
  if (!hasUrls) {
    return Promise.reject(translate('wrongSetup'));
  }
  let lastIndex = 0;
  return setupConfig.urls.reduce((currentPromise, url, index) => {
    url = URLUtils.normalizeUrl(url);
    return currentPromise
      .then(({ connectivityStatus }) => {
        lastIndex = index;
        if (connectivityStatus && connectivityStatus.isAmpAvailable) {
          // at least one url worked, halt here
          return Promise.resolve(connectivityStatus);
        }
        return testAMPUrl(url);
      })
      .catch(() => testAMPUrl(url));
  }, Promise.resolve())
    .then(({ connectivityStatus, fixedUrl }) => {
      if (connectivityStatus && connectivityStatus.isAmpAvailable) {
        // set the good url to be the first one to use
        setupConfig.urls[lastIndex] = fixedUrl;
        const goodUrl = setupConfig.urls[lastIndex];
        setupConfig.urls = [goodUrl].concat(setupConfig.urls.filter(u => u !== goodUrl));
        return Promise.resolve(goodUrl);
      }
      return Promise.reject(translate('urlNotWorking'));
    });
}

function testAMPUrl(url) {
  return URLUtils.getPossibleUrlSetupFixes(url).reduce((currentPromise, fixedUrl) =>
    currentPromise.then(result => {
      if (result && result.connectivityStatus && result.connectivityStatus.isAmpAvailable) {
        return Promise.resolve(result);
      }
      configureConnectionInformation(SetupManager.buildConnectionInformation(fixedUrl));
      return connectivityCheck().then(connectivityStatus => ({ connectivityStatus, fixedUrl }));
    })
  , Promise.resolve());
}

export function loadSetupOptions() {
  return (dispatch) => dispatch({
    type: STATE_SETUP_OPTIONS,
    payload: SetupManager.getSetupOptions()
  });
}
