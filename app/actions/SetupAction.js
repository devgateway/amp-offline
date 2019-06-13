import store from '../index';
import SetupManager from '../modules/setup/SetupManager';
import { LANGUAGE_ENGLISH, SETUP_URL } from '../utils/Constants';
import * as CSC from '../utils/constants/ClientSettingsConstants';
import * as GSC from '../utils/constants/GlobalSettingsConstants';
import * as URLUtils from '../utils/URLUtils';
import Logger from '../modules/util/LoggerManager';
import {
  configureConnectionInformation,
  connectivityCheck,
  getRegisteredServerId,
  getStatusNotification,
  isConnectivityCheckInProgress,
  isValidConnectionByStatus
} from './ConnectivityAction';
import translate from '../utils/translate';
import ConnectionInformation from '../modules/connectivity/ConnectionInformation';
import * as Utils from '../utils/Utils';
import { AMP_SERVER_ID, RESPONSE_CHECK_INTERVAL_MS } from '../modules/connectivity/AmpApiConstants';
import * as ClientSettingsHelper from '../modules/helpers/ClientSettingsHelper';
import GlobalSettingsManager from '../modules/util/GlobalSettingsManager';
import { newUrlsDetected } from './SettingAction';
import { IS_CHECK_URL_CHANGES } from '../modules/util/ElectronApp';
import NotificationHelper from '../modules/helpers/NotificationHelper';
import * as constants from '../utils/constants/ErrorConstants';
import ConnectivityStatus from '../modules/connectivity/ConnectivityStatus';

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
export const STATE_URL_TEST_RESULT_PROCESSED = 'STATE_URL_TEST_RESULT_PROCESSED';
export const STATE_AMP_REGISTRY_CHECK_PENDING = 'STATE_AMP_REGISTRY_CHECK_PENDING';
export const STATE_AMP_REGISTRY_CHECK_COMPLETED = 'STATE_AMP_REGISTRY_CHECK_COMPLETED';


const logger = new Logger('Setup action');

/**
 * Verifies if current version can start or user confirmation is needed
 * @return {true|NotificationHelper} continue or ask user to confirm with the given message
 */
export function canCurrentVersionStartOrConfirmationNeeded() {
  return SetupManager.getNewestVersionAuditLog().then(newestUsed => {
    const currentVersion = Utils.getCurrentVersion();
    logger.log(`Starting ${currentVersion} version. The newest used before: ${newestUsed}`);
    if (currentVersion === newestUsed) {
      return true;
    }
    const replacePairs = [['%current-version%', currentVersion], ['%newest-used%', newestUsed]];
    return new NotificationHelper({
      message: 'oldVersionWarning',
      origin: constants.NOTIFICATION_ORIGIN_SETUP,
      replacePairs
    });
  });
}

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
  URLUtils.forwardTo(SETUP_URL);
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
      const setupCompletePromise = attemptToConfigureAndSaveSetup(customOption);
      store.dispatch(notifySetupComplete(setupCompletePromise));
      return setupCompletePromise;
    }
    return configureConnectionInformation(connectionInformation);
  });
}

export function setupComplete(setupConfig) {
  return (dispatch) => dispatch(notifySetupComplete(attemptToConfigureAndSaveSetup(setupConfig)));
}

/**
 * Will attempt to configure the url settings
 * @param setupConfig
 * @returns {true|string} will return true on successful attempt or the error message in case of a failure
 */
function attemptToConfigureAndSaveSetup(setupConfig) {
  logger.log('attemptToConfigureAndSaveSetup');
  return attemptToConfigure(setupConfig)
    .then(() => SetupManager.saveSetupAndCleanup(setupConfig))
    .then(() => true);
}

function attemptToConfigure(setupConfig) {
  return SetupManager.getConnectionInformation()
    .then(savedConnInformation => configureAndTestConnectivity(setupConfig)
      .then(() => {
        const fixedUrl = setupConfig.urls[0];
        configureConnectionInformation(SetupManager.buildConnectionInformationOnFullUrl(fixedUrl));
        return connectivityCheck();
      })
      .catch((error) => {
        configureConnectionInformation(savedConnInformation);
        return Promise.reject(error);
      }));
}

function notifySetupComplete(setupResult) {
  return (dispatch) => dispatch({
    type: STATE_SETUP_STATUS,
    payload: setupResult
  });
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
        connectivityCheck(currentConnectionInformation);
        return result;
      });
  }

  return (dispatch) => dispatch({
    type: STATE_URL_TEST_RESULT,
    payload: promise
  });
}

export function testUrlResultProcessed(url) {
  return (disaptch) => disaptch({
    type: STATE_URL_TEST_RESULT_PROCESSED,
    actionData: { url }
  });
}

export function configureAndTestConnectivity(setupConfig) {
  const hasUrls = setupConfig && setupConfig.urls && setupConfig.urls.length;
  if (!hasUrls) {
    return Promise.reject(new NotificationHelper({ message: 'wrongSetup' }));
  }
  let lastIndex = 0;
  return setupConfig.urls.reduce((currentPromise, url, index) => {
    url = URLUtils.normalizeUrl(url);
    return currentPromise
      .then(({ connectivityStatus }) => {
        lastIndex = index;
        if (isValidConnectionByStatus(connectivityStatus, true)) {
          // at least one url worked, halt here
          return Promise.resolve({ connectivityStatus, fixedUrl: url });
        }
        return testAMPUrl(url);
      })
      .catch(() => testAMPUrl(url));
  }, Promise.resolve())
    .then(({ connectivityStatus, fixedUrl }) => {
      if (isValidConnectionByStatus(connectivityStatus, true)) {
        // set the good url to be the first one to use
        setupConfig.urls[lastIndex] = fixedUrl;
        const goodUrl = setupConfig.urls[lastIndex];
        setupConfig.urls = [goodUrl].concat(setupConfig.urls.filter(u => u !== goodUrl));
        return Promise.resolve(goodUrl);
      }
      return Promise.reject(getStatusNotification(connectivityStatus, true));
    });
}

function testAMPUrl(url) {
  // since we try to fix the url automatically, we will track the result of the relevant URL to report if none work
  let relevantUrlResult;
  return URLUtils.getPossibleUrlSetupFixes(url).reduce((currentPromise, fixedUrl) =>
      currentPromise.then(result => {
        relevantUrlResult = getRelevantResult(relevantUrlResult, result);
        if (isValidConnectionByStatus(result && result.connectivityStatus, true)) {
          return Promise.resolve(result);
        }
        return connectivityCheck(SetupManager.buildConnectionInformationForTest(fixedUrl))
          .then(connectivityStatus => ({ connectivityStatus, fixedUrl }));
      })
    , Promise.resolve())
    .then(result => {
      relevantUrlResult = getRelevantResult(relevantUrlResult, result);
      if (isValidConnectionByStatus(result && result.connectivityStatus, true) || !relevantUrlResult) {
        return result;
      }
      return relevantUrlResult;
    });
}

function getRelevantResult(r1, r2) {
  if (r1 && r2) {
    const s1 = r1.connectivityStatus;
    const s2 = r2.connectivityStatus;
    return ConnectivityStatus.getLeastCriticalStatus(s1, s2) === s1 ? r1 : r2;
  }
  return r1 || r2;
}

export function loadSetupOptions() {
  return (dispatch) => dispatch({
    type: STATE_SETUP_OPTIONS,
    payload: SetupManager.getSetupOptions()
  });
}

export function checkAmpRegistryForUpdates() {
  if (!didSetupComplete() || !IS_CHECK_URL_CHANGES) {
    ampRegistryCheckComplete();
    return Promise.resolve();
  }
  ampRegistryCheckPending();
  return ClientSettingsHelper.findAllSettingsByNamesAndMapByKey(
    [CSC.SETUP_CONFIG, CSC.AMP_SETTINGS_FROM_AMP_REGISTRY, CSC.LAST_AMP_SETTINGS_STATUS])
    .then(smap => {
      const setupConfigSetting = smap.get(CSC.SETUP_CONFIG);
      const prevAmpRegistrySetting = smap.get(CSC.AMP_SETTINGS_FROM_AMP_REGISTRY);
      const prevStatusSetting = smap.get(CSC.LAST_AMP_SETTINGS_STATUS);
      return getAmpRegistrySetting(setupConfigSetting)
        .then(ampRegistryCountry => {
          const newUrls = getNewUrls(ampRegistryCountry, setupConfigSetting, prevAmpRegistrySetting, prevStatusSetting);
          if (newUrls) {
            prevAmpRegistrySetting.value = ampRegistryCountry || prevAmpRegistrySetting.value;
            prevStatusSetting.value = CSC.LAST_AMP_SETTINGS_STATUS_PENDING;
            return ClientSettingsHelper.saveOrUpdateCollection([prevAmpRegistrySetting, prevStatusSetting])
              .then(() => newUrlsDetected(newUrls));
          }
          ampRegistryCheckComplete();
          return newUrls;
        });
    })
    .catch(error => {
      // since runs at startup, any error shouldn't block the chain
      logger.error(error);
      ampRegistryCheckComplete();
    });
}

function getAmpRegistrySetting(setupConfigSetting) {
  const serverId = getRegisteredServerId();
  const countryGS = GlobalSettingsManager.getSettingByKey(GSC.DEFAULT_COUNTRY);
  let iso2 = setupConfigSetting.value.iso2 || countryGS;
  iso2 = iso2 && iso2.toLowerCase();
  return SetupManager.getSetupOptions()
    .then(ampRegistrySettings => {
      const ampRegistryCountry = ampRegistrySettings.find(s => isSettingForAmp(s, serverId, iso2));
      if (ampRegistryCountry) {
        ampRegistryCountry.urls = ampRegistryCountry.urls.map(URLUtils.normalizeUrl);
      }
      return ampRegistryCountry;
    });
}

function isSettingForAmp(registrySetting, serverId, iso2) {
  if (serverId) {
    return registrySetting[AMP_SERVER_ID] === serverId;
  }
  return registrySetting.iso2 && iso2 && (registrySetting.iso2.toLowerCase() === iso2);
}

function getNewUrls(ampRegistryCountry, setupConfigSetting, prevAmpRegistrySetting, prevStatusSetting) {
  const currentUrls = setupConfigSetting.value.urls;
  let newUrls = ampRegistryCountry && new Set(ampRegistryCountry.urls);
  const prevUrls = prevAmpRegistrySetting && prevAmpRegistrySetting.value && new Set(prevAmpRegistrySetting.value.urls);
  const isPrevUrlsPending = prevStatusSetting && prevStatusSetting.value === CSC.LAST_AMP_SETTINGS_STATUS_PENDING;
  if (newUrls && prevUrls && !isPrevUrlsPending) {
    // check if previously reviewed URLs match new URLs to see if to report new URLs or not anymore
    if (newUrls.size === prevUrls.size && ampRegistryCountry.urls.every(url => prevUrls.has(url))) {
      newUrls = null;
    }
  } else if (!newUrls && isPrevUrlsPending) {
    // if the latest URLs cannot be detected (e.g. connectivity issue), then use any pending URLs from previous check
    newUrls = prevUrls;
  }
  if (newUrls) {
    let matchingUrlsCount = 0;
    const newUrlsCount = newUrls.size;
    currentUrls.forEach(url => {
      if (newUrls.has(url)) {
        matchingUrlsCount += 1;
      } else {
        newUrls.add(url);
      }
    });
    if (matchingUrlsCount === newUrlsCount) {
      newUrls = null;
    }
  }
  return newUrls && Array.from(newUrls.keys());
}

export const ampRegistryCheckPending = () => store.dispatch({ type: STATE_AMP_REGISTRY_CHECK_PENDING });

export const ampRegistryCheckComplete = () => store.dispatch({ type: STATE_AMP_REGISTRY_CHECK_COMPLETED });

export const newUrlsReviewed = () =>
  ClientSettingsHelper.findAllSettingsByNamesAndMapByKey(
    [CSC.SETUP_CONFIG, CSC.AMP_SETTINGS_FROM_AMP_REGISTRY, CSC.LAST_AMP_SETTINGS_STATUS])
    .then(smap => {
      const setupConfigSetting = smap.get(CSC.SETUP_CONFIG);
      const lastStatusSetting = smap.get(CSC.LAST_AMP_SETTINGS_STATUS);
      lastStatusSetting.value = CSC.LAST_AMP_SETTINGS_STATUS_REVIEWED;
      const urls = setupConfigSetting.value.urls;
      setupConfigSetting.value = smap.get(CSC.AMP_SETTINGS_FROM_AMP_REGISTRY).value;
      setupConfigSetting.value.urls = urls;
      return ClientSettingsHelper.saveOrUpdateCollection([lastStatusSetting, setupConfigSetting]);
    });

export const didUrlChangesCheckComplete = () => {
  const { setupReducer, settingReducer } = store.getState();
  return setupReducer.isAmpRegistryChecked && !settingReducer.newUrls;
};
