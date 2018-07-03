// TODO: this action is not going to be called from a component, its an initialization action
import store from '../index';
import { connectivityCheck, loadConnectionInformation } from './ConnectivityAction';
import { loadCurrencyRates } from './CurrencyRatesAction';
import { CONNECTIVITY_CHECK_INTERVAL } from '../utils/Constants';
import Logger from '../modules/util/LoggerManager';
import NumberUtils from '../utils/NumberUtils';
import * as GlobalSettingsHelper from '../modules/helpers/GlobalSettingsHelper';
import * as FMHelper from '../modules/helpers/FMHelper';
import { initLanguage, loadAllLanguages } from '../actions/TranslationAction';
import FeatureManager from '../modules/util/FeatureManager';
import GlobalSettingsManager from '../modules/util/GlobalSettingsManager';
import ClientSettingsManager from '../modules/settings/ClientSettingsManager';
import TranslationManager from '../modules/util/TranslationManager';
import { checkIfSetupComplete, configureDefaults } from './SetupAction';
import RepositoryManager from '../modules/repository/RepositoryManager';
import { deleteOrphanResources } from './ResourceAction';

export const TIMER_START = 'TIMER_START';
// this will be used if we decide to have an action stopping
export const TIMER_STOP = 'TIMER_STOP';
// we keep the timer as a variable in case we want to be able to stop it
let timer;

export const STATE_PARAMETERS_FAILED = 'STATE_PARAMETERS_FAILED';
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

const logger = new Logger('Startup action');

export function ampOfflineStartUp() {
  return ClientSettingsManager.initDBWithDefaults()
    .then(checkIfSetupComplete)
    .then(isSetupComplete =>
      TranslationManager.initializeTranslations(isSetupComplete)
        .then(() => configureDefaults(isSetupComplete))
    )
    .then(ampOfflineInit)
    .then(initLanguage)
    .then(() => nonCriticalRoutinesStartup());
}

export function ampOfflineInit() {
  store.dispatch(loadAllLanguages());
  return checkIfSetupComplete()
    .then(loadConnectionInformation)
    .then(scheduleConnectivityCheck)
    .then(loadGlobalSettings)
    .then(() => loadFMTree())
    .then(loadCurrencyRatesOnStartup);
}

function nonCriticalRoutinesStartup() {
  RepositoryManager.init(true);
  return deleteOrphanResources();
}

// exporting timer from a function since we cannot export let
export function getTimer() {
  return timer;
}

function scheduleConnectivityCheck() {
  return connectivityCheck().then(() => {
    clearInterval(timer);
    timer = setInterval(() => connectivityCheck(), CONNECTIVITY_CHECK_INTERVAL);
    store.dispatch({ type: TIMER_START });
    return Promise.resolve();
  });
}

/**
 * Loads GS as { key: value } pairs to be ready for sync usage, since the list is small and is readonly on the client.
 * @return {Promise}
 */
export function loadGlobalSettings() {
  logger.log('loadGlobalSettings');
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
  logger.log('loadFMTree');
  const dbFilter = id ? { id } : {};
  const fmPromise = FMHelper.findAll(dbFilter)
    .then(fmTrees => (fmTrees.length ? fmTrees[0] : null))
    .then(fmTree => {
      FeatureManager.setFMTree(fmTree ? fmTree.fmTree : null);
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

// TODO: Use this function somewhere.
/* eslint no-unused-vars: 0 */
function startUpFailed(err) {
  logger.log('startUpFailed');
  return {
    type: STATE_PARAMETERS_FAILED,
    actionData: { errorMessage: err }
  };
}
