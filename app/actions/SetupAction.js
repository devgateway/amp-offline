import store from '../index';
import SetupManager from '../modules/setup/SetupManager';
import { LANGUAGE_ENGLISH, SETUP_URL } from '../utils/Constants';
import * as URLUtils from '../utils/URLUtils';
import Logger from '../modules/util/LoggerManager';
import { configureConnectionInformation, connectivityCheck, isConnectivityCheckInProgress } from './ConnectivityAction';
import translate from '../utils/translate';
import ConnectionInformation from '../modules/connectivity/ConnectionInformation';
import * as Utils from '../utils/Utils';
import { RESPONSE_CHECK_INTERVAL_MS } from '../modules/connectivity/AmpApiConstants';

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
const STATE_URL_TEST_RESULT = 'STATE_URL_TEST_RESULT';
export const STATE_URL_TEST_RESULT_PENDING = 'STATE_URL_TEST_RESULT_PENDING';
export const STATE_URL_TEST_RESULT_FULFILLED = 'STATE_URL_TEST_RESULT_FULFILLED';
export const STATE_URL_TEST_RESULT_REJECTED = 'STATE_URL_TEST_RESULT_REJECTED';

const logger = new Logger('Setup action');

export function checkIfSetupComplete() {
  logger.log('checkIfSetupComplete');
  const setupCompleteSettingPromise = SetupManager.didSetupComplete();
  store.dispatch({
    type: STATE_SETUP_STATUS,
    payload: setupCompleteSettingPromise
  });
  return setupCompleteSettingPromise;
}

export function doSetupFirst() {
  logger.log('doSetupFirst');
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
  logger.log(`configureDefaults with isSetupComplete=${isSetupComplete}`);
  const setupDefaultsPromise = SetupManager.setDefaults(isSetupComplete);
  store.dispatch({
    type: STATE_SETUP_DEFAULTS,
    payload: setupDefaultsPromise
  });
  return setupDefaultsPromise;
}

export function configureOnLoad() {
  logger.log('configureOnLoad');
  return SetupManager.getConnectionInformation().then((connectionInformation: ConnectionInformation) => {
    const isTestingEnv = +process.env.USE_TEST_AMP_URL;
    if (isTestingEnv && !didSetupComplete()) {
      const customOption = SetupManager.getCustomOption([LANGUAGE_ENGLISH]);
      customOption.urls = [connectionInformation.getFullUrl()];
      return setupComplete(customOption);
    }
    return configureConnectionInformation(connectionInformation);
  });
}

export function setupComplete(setupConfig) {
  logger.log('setupComplete');
  const saveSetupSettingsPromise = configureAndTestConnectivity(setupConfig)
    .then(() => SetupManager.saveSetupAndCleanup(setupConfig))
    .then(() => true);
  store.dispatch({
    type: STATE_SETUP_STATUS,
    payload: saveSetupSettingsPromise
  });
  return saveSetupSettingsPromise;
}

export function testUrlByKeepingCurrentSetup(url) {
  url = URLUtils.normalizeUrl(url);
  let promise;
  if (!URLUtils.isValidUrl(url)) {
    promise = Promise.resolve({ url, errorMessage: translate('urlNotWorking') });
  } else {
    let currentConnectionInformation;
    promise = Utils.waitWhile(isConnectivityCheckInProgress, RESPONSE_CHECK_INTERVAL_MS)
      .then(() => SetupManager.getConnectionInformation())
      .then(savedConnInformation => {
        currentConnectionInformation = savedConnInformation;
        const dummySetup = Utils.toMap('urls', [url]);
        return configureAndTestConnectivity(dummySetup)
          .then(goodUrl => ({ url, goodUrl }))
          .catch(error => ({ url, errorMessage: error }));
      })
      .then(result => {
        waitConfigureConnectionInformation(currentConnectionInformation);
        return result;
      });
  }

  return (dispatch) => dispatch({
    type: STATE_URL_TEST_RESULT,
    payload: promise
  });
}

function waitConfigureConnectionInformation(connectionInformation) {
  return Utils.waitWhile(isConnectivityCheckInProgress, RESPONSE_CHECK_INTERVAL_MS)
    .then(() => configureConnectionInformation(connectionInformation))
    .then(connectivityCheck);
}

export function configureAndTestConnectivity(setupConfig) {
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
        return waitConfigureConnectionInformation(SetupManager.buildConnectionInformation(fixedUrl))
          .then(connectivityStatus => ({ connectivityStatus, fixedUrl }));
      })
    , Promise.resolve());
}

export function loadSetupOptions() {
  return (dispatch) => dispatch({
    type: STATE_SETUP_OPTIONS,
    payload: SetupManager.getSetupOptions()
  });
}
