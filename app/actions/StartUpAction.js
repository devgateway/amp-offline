// TODO: this action is not going to be called from a component, its an initialization action
import store from '../index';
import { connectivityCheck } from './ConnectivityAction';
import ConnectionInformation from '../modules/connectivity/ConnectionInformation';
// this is temporal will be stored in settings
import {
  SERVER_URL,
  BASE_REST_URL,
  PROTOCOL,
  BASE_PORT,
  CONNECTION_TIMEOUT,
  CONNECTIVITY_CHECK_INTERVAL
} from '../utils/Constants';
import LoggerManager from '../modules/util/LoggerManager';
import NumberUtils from '../utils/NumberUtils';

export const STATE_PARAMETERS_LOADED = 'STATE_PARAMETERS_LOADED';
export const STATE_PARAMETERS_LOADING = 'STATE_PARAMETERS_LOADING';
export const STATE_PARAMETERS_FAILED = 'STATE_PARAMETERS_FAILED';

export const TIMER_START = 'TIMER_START';
// this will be used if we decide to have an action stopping
export const TIMER_STOP = 'TIMER_STOP';
// we keep the timer as a variable in case we want to be able to stop it
let timer;

export const STATE_GS_NUMBERS_LOADED = 'STATE_GS_NUMBERS_LOADED';

/**
 * Checks and updates the connectivity status
 * @returns ConnectivityStatus
 */
export function ampStartUp() {
  return loadConnectionInformation().then(scheduleConnectivityCheck).then(loadNumberSettings);
}

export function loadConnectionInformation() {
  return new Promise((resolve, reject) => {
    LoggerManager.log('ampStartUp');
    store.dispatch(sendingRequest());
    // TODO we will have a module that will return this from storage, hardcoded in this first commit
    const connectionInformation = new ConnectionInformation(SERVER_URL, BASE_REST_URL,
      PROTOCOL, BASE_PORT, CONNECTION_TIMEOUT);
    store.dispatch(startUpLoaded(connectionInformation));
    //  It is dispatch here so its called righ away. since for default it is
    // Scheduled every 5 minutes, we need to check whether amp is on line or not right away
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

function loadNumberSettings() {
  LoggerManager.log('loadNumberSettings');
  return new Promise((resolve, reject) => (
    NumberUtils.getConfigFromDB().then((data) => {
      store.dispatch({ type: STATE_GS_NUMBERS_LOADED, actionData: data });
      return resolve();
    }).catch(reject)
  ));
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
