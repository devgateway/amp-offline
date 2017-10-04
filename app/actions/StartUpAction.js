// TODO: this action is not going to be called from a component, its an initialization action
import store from '../index';
import { connectivityCheck } from './ConnectivityAction';
import { loadCurrencyRates } from './CurrencyRatesAction';
import ConnectionInformation from '../modules/connectivity/ConnectionInformation';
import {
  BASE_PORT,
  BASE_REST_URL,
  CONNECTION_FORCED_TIMEOUT,
  CONNECTION_TIMEOUT,
  CONNECTIVITY_CHECK_INTERVAL,
  PROTOCOL,
  SERVER_URL
} from '../utils/Constants';
import LoggerManager from '../modules/util/LoggerManager';
import NumberUtils from '../utils/NumberUtils';
import * as GlobalSettingsHelper from '../modules/helpers/GlobalSettingsHelper';
import * as FMHelper from '../modules/helpers/FMHelper';
import { initLanguage, loadAllLanguages } from '../actions/TranslationAction';
import FeatureManager from '../modules/util/FeatureManager';
import GlobalSettingsManager from '../modules/util/GlobalSettingsManager';
import ClientSettingsManager from '../modules/settings/ClientSettingsManager';
import { initializeI18Next, initializeLanguageDirectory } from '../modules/util/TranslationManager';
import { checkIfSetupComplete } from './SetupAction';

export const STATE_PARAMETERS_LOADED = 'STATE_PARAMETERS_LOADED';
export const STATE_PARAMETERS_LOADING = 'STATE_PARAMETERS_LOADING';
export const STATE_PARAMETERS_FAILED = 'STATE_PARAMETERS_FAILED';

export const TIMER_START = 'TIMER_START';
// this will be used if we decide to have an action stopping
export const TIMER_STOP = 'TIMER_STOP';
// we keep the timer as a variable in case we want to be able to stop it
let timer;

export const STATE_GS_NUMBERS_LOADED = 'STATE_GS_NUMBERS_LOADED';
export const STATE_GS_DATE_LOADED = 'STATE_GS_DATE_LOADED';
export const STATE_GS_PENDING = 'STATE_GS_PENDING';
export const STATE_GS_FULFILLED = 'STATE_GS_FULFILLED';
export const STATE_GS_REJECTED = 'STATE_GS_REJECTED';
const STATE_GS = 'STATE_GS';
export const STATE_FM_PENDING = 'STATE_FM_PENDING';
export const STATE_FM_FULFILLED = 'STATE_FM_FULFILLED';
export const STATE_FM_REJECTED = 'STATE_FM_REJECTED';
const STATE_FM = 'STATE_FM';

export function ampOfflineStartUp() {
  return ClientSettingsManager.initDBWithDefaults()
    .then(checkIfSetupComplete)
    .then(isSetupComplete => {
      initializeLanguageDirectory(isSetupComplete);
      return initializeI18Next();
    })
    .then(ampOfflineInit)
    .then(initLanguage);
}

export function ampOfflineInit() {
  store.dispatch(loadAllLanguages());
  return loadConnectionInformation()
    .then(scheduleConnectivityCheck)
    .then(loadGlobalSettings)
    .then(() => loadFMTree())
    .then(loadCurrencyRatesOnStartup);
}

export function loadConnectionInformation() {
  return new Promise((resolve, reject) => {
    LoggerManager.log('ampStartUp');
    store.dispatch(sendingRequest());
    // TODO we will have a module that will return this from storage, hardcoded in this first commit
    const connectionInformation = new ConnectionInformation(SERVER_URL, BASE_REST_URL,
      PROTOCOL, BASE_PORT, CONNECTION_TIMEOUT, CONNECTION_FORCED_TIMEOUT);
    store.dispatch(startUpLoaded(connectionInformation));
    //  It is dispatch here so its called right away. since for default it is
    // Scheduled every x(configured) minutes, we need to check whether amp is on line or not right away
    connectivityCheck();
    return resolve();
  });
}

// exporting timer from a function since we cannot export let
export function getTimer() {
  return timer;
}

function scheduleConnectivityCheck() {
  return new Promise((resolve, reject) => {
    clearInterval(timer);
    timer = setInterval(() => connectivityCheck(), CONNECTIVITY_CHECK_INTERVAL);
    store.dispatch({ type: TIMER_START });
    return resolve();
  });
}

/**
 * Loads GS as { key: value } pairs to be ready for sync usage, since the list is small and is readonly on the client.
 * @return {Promise}
 */
export function loadGlobalSettings() {
  LoggerManager.log('loadGlobalSettings');
  const gsPromise = GlobalSettingsHelper.findAll({}).then(gsList => {
    const gsData = {};
    // update default GS settings to those from the store only if any available in the store
    if (gsList.length) {
      gsList.forEach(gs => {
        gsData[gs.key] = gs.value;
      });
      GlobalSettingsManager.setGlobalSettings(gsData);
    }
    NumberUtils.createLanguage();
    return gsData;
  });
  store.dispatch({
    type: STATE_GS,
    payload: gsPromise
  });
  return gsPromise;
}

/**
 * Loads FM tree, since it's a very small structure and is handy to check synchronously
 * @param id FM tree ID. If not specified, the first one will be used (Iteration 1 countries)
 */
export function loadFMTree(id = undefined) {
  LoggerManager.log('loadFMTree');
  const dbFilter = id ? { id } : {};
  const fmPromise = FMHelper.findAll(dbFilter)
    .then(fmTrees => (fmTrees.length ? fmTrees[0] : null))
    .then(fmTree => {
      FeatureManager.setFMTree(fmTree);
      return fmTree;
    });
  store.dispatch({
    type: STATE_FM,
    payload: fmPromise
  });
  return fmPromise;
}

export function loadCurrencyRatesOnStartup() {
  store.dispatch(loadCurrencyRates());
}

function startUpLoaded(connectionInformation) {
  return {
    type: STATE_PARAMETERS_LOADED,
    actionData: { connectionInformation }
  };
}

// TODO: Use this function somewhere.
/* eslint no-unused-vars: 0 */
function startUpFailed(err) {
  LoggerManager.log('startUpFailed');
  return {
    type: STATE_PARAMETERS_FAILED,
    actionData: { errorMessage: err }
  };
}

function sendingRequest() {
  LoggerManager.log('sendingRequest');
  return {
    type: STATE_PARAMETERS_LOADING
  };
}
