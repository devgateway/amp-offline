// TODO: this action is not going to be called from a component, its an initialization action
import store from '../index';
import { connectivityCheck } from './ConnectivityAction';
import { loadCurrencyRates } from './CurrencyRatesAction';
import ConnectionInformation from '../modules/connectivity/ConnectionInformation';
// this is temporal will be stored in settings
import {
  BASE_PORT,
  BASE_REST_URL,
  CONNECTION_TIMEOUT,
  CONNECTIVITY_CHECK_INTERVAL,
  PROTOCOL,
  SERVER_URL
} from '../utils/Constants';
import LoggerManager from '../modules/util/LoggerManager';
import NumberUtils from '../utils/NumberUtils';
import DateUtils from '../utils/DateUtils';
import * as GlobalSettingsHelper from '../modules/helpers/GlobalSettingsHelper';

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

/**
 * Checks and updates the connectivity status
 * @returns ConnectivityStatus
 */
export function ampStartUp() {
  return loadConnectionInformation()
    .then(scheduleConnectivityCheck)
    .then(loadNumberSettings)
    .then(loadDateSettings)
    .then(loadGlobalSettings)
    .then(loadCurrencyRatesOnStartup);
}

export function loadConnectionInformation() {
  return new Promise((resolve, reject) => {
    LoggerManager.log('ampStartUp');
    store.dispatch(sendingRequest());
    // TODO we will have a module that will return this from storage, hardcoded in this first commit
    const connectionInformation = new ConnectionInformation(SERVER_URL, BASE_REST_URL,
      PROTOCOL, BASE_PORT, CONNECTION_TIMEOUT);
    store.dispatch(startUpLoaded(connectionInformation));
    //  It is dispatch here so its called right away. since for default it is
    // Scheduled every x(configured) minutes, we need to check whether amp is on line or not right away
    store.dispatch(connectivityCheck());
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
    timer = setInterval(() => store.dispatch(connectivityCheck()), CONNECTIVITY_CHECK_INTERVAL);
    store.dispatch({ type: TIMER_START });
    return resolve();
  });
}

export function loadNumberSettings() {
  LoggerManager.log('loadNumberSettings');
  return new Promise((resolve, reject) => (
    NumberUtils.getConfigFromDB().then((data) => {
      store.dispatch({ type: STATE_GS_NUMBERS_LOADED, actionData: data });
      NumberUtils.createLanguage();
      return resolve();
    }).catch(reject)
  ));
}

export function loadDateSettings() {
  LoggerManager.log('loadDateSettings');
  return new Promise((resolve, reject) => (
    DateUtils.getConfigFromDB().then((data) => {
      store.dispatch({ type: STATE_GS_DATE_LOADED, actionData: data });
      return resolve();
    }).catch(reject)
  ));
}

/**
 * Loads GS as { key: value } pairs to be ready for sync usage, since the list is small and is readonly on the client.
 * @return {Promise}
 */
export function loadGlobalSettings() {
  LoggerManager.log('loadGlobalSettings');
  const gsPromise = GlobalSettingsHelper.findAll({}).then(gsList => {
    const gsData = {};
    gsList.forEach(gs => {
      gsData[gs.key] = gs.value;
    });
    return gsData;
  });
  store.dispatch({
    type: STATE_GS,
    payload: gsPromise
  });
  return gsPromise;
}

export function loadCurrencyRatesOnStartup() {
  return new Promise((resolve) => {
    store.dispatch(loadCurrencyRates());
    resolve();
  });
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
