import { Constants, PossibleValuesManager, FeatureManager, GlobalSettingsConstants, NumberUtils } from 'amp-ui';
import store from '../index';
import { connectivityCheck, loadConnectionInformation } from './ConnectivityAction';
import { loadCurrencyRates } from './CurrencyRatesAction';
import Logger from '../modules/util/LoggerManager';
import translate from '../utils/translate';
import * as GlobalSettingsHelper from '../modules/helpers/GlobalSettingsHelper';
import * as FMHelper from '../modules/helpers/FMHelper';
import DateUtils from '../utils/DateUtils';
import { initLanguage, loadAllLanguages } from '../actions/TranslationAction';
import GlobalSettingsManager from '../modules/util/GlobalSettingsManager';
import ClientSettingsManager from '../modules/settings/ClientSettingsManager';
import TranslationManager from '../modules/util/TranslationManager';
import {
  ampRegistryCheckComplete,
  canCurrentVersionStartOrConfirmationNeeded,
  checkAmpRegistryForUpdates,
  checkIfSetupComplete,
  configureDefaults
} from './SetupAction';
import RepositoryManager from '../modules/repository/RepositoryManager';
import { deleteOrphanResources } from './ResourceAction';
import SetupManager from '../modules/setup/SetupManager';
import CalendarHelper from '../modules/helpers/CalendarHelper';
import { dbMigrationsManager } from './DBMigrationsAction';
import * as MC from '../utils/constants/MigrationsConstants';

export const TIMER_START = 'TIMER_START';
// this will be used if we decide to have an action stopping
export const TIMER_STOP = 'TIMER_STOP';
// we keep the timer as a variable in case we want to be able to stop it
let timer;

const STATE_INITIALIZATION = 'STATE_INITIALIZATION';
export const STATE_INITIALIZATION_PENDING = 'STATE_INITIALIZATION_PENDING';
export const STATE_INITIALIZATION_FULFILLED = 'STATE_INITIALIZATION_FULFILLED';
export const STATE_INITIALIZATION_REJECTED = 'STATE_INITIALIZATION_REJECTED';
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
export const STATE_CALENDAR_PENDING = 'STATE_CALENDAR_PENDING';
export const STATE_CALENDAR_FULFILLED = 'STATE_CALENDAR_FULFILLED';
export const STATE_CALENDAR_REJECTED = 'STATE_CALENDAR_REJECTED';
const STATE_CALENDAR = 'STATE_CALENDAR';

const logger = new Logger('Startup action');

/**
 * Prepares the minimum startup related data and provides the newest version used so far
 * @return {true|NotificationHelper} continue or ask for user confirmation to continue
 */
export function ampOfflinePreStartUp() {
  return ClientSettingsManager.initDBWithDefaults()
    .then(SetupManager.auditStartup)
    .then(checkIfSetupComplete)
    .then(isSetupComplete =>
      TranslationManager.initializeTranslations(isSetupComplete)
        .then(() => configureDefaults(isSetupComplete))
    )
    .then(canCurrentVersionStartOrConfirmationNeeded);
}

/**
 * Regular startup routines
 * @return {Promise}
 */
export function ampOfflineStartUp() {
  return Promise.resolve()
    .then(() => dbMigrationsManager.run(MC.CONTEXT_STARTUP))
    .then(ampOfflineInit)
    .then(runDbMigrationsPostInit)
    .then(initLanguage)
    .then(() => nonCriticalRoutinesStartup());
}

export function ampOfflineInit(isPostLogout = false) {
  store.dispatch(loadAllLanguages());
  const initPromise = checkIfSetupComplete()
    .then(loadConnectionInformation)
    .then(scheduleConnectivityCheck)
    .then(loadGlobalSettings)
    .then(() => loadFMTree())
    .then(loadCurrencyRatesOnStartup)
    .then(loadCalendar)
    .then(loadPossibleValuesManager)
    .then(() => (isPostLogout ? postLogoutInit() : null));
  store.dispatch({
    type: STATE_INITIALIZATION,
    payload: initPromise
  });
  return initPromise;
}

function runDbMigrationsPostInit() {
  return dbMigrationsManager.run(MC.CONTEXT_INIT).then(execNr => (execNr ? ampOfflineInit() : execNr));
}

function nonCriticalRoutinesStartup() {
  RepositoryManager.init(true);
  return checkAmpRegistryForUpdates()
    .then(deleteOrphanResources);
}

/**
 * During logout, the redux state is reset as a simplest solution. Manually handle few post logout reinit actions.
 */
function postLogoutInit() {
  ampRegistryCheckComplete();
}

// exporting timer from a function since we cannot export let
export function getTimer() {
  return timer;
}

function scheduleConnectivityCheck() {
  return connectivityCheck().then(() => {
    clearInterval(timer);
    timer = setInterval(() => connectivityCheck(), Constants.CONNECTIVITY_CHECK_INTERVAL);
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
    NumberUtils.registerSettings({
      gsDefaultGroupSeparator: GlobalSettingsManager.getSettingByKey(
        GlobalSettingsConstants.GS_DEFAULT_GROUPING_SEPARATOR),
      gsDefaultDecimalSeparator: GlobalSettingsManager.getSettingByKey(
        GlobalSettingsConstants.GS_DEFAULT_DECIMAL_SEPARATOR),
      gsDefaultNumberFormat: GlobalSettingsManager.getSettingByKey(
        GlobalSettingsConstants.GS_DEFAULT_NUMBER_FORMAT),
      gsAmountInThousands: GlobalSettingsManager.getSettingByKey(
        GlobalSettingsConstants.GS_AMOUNTS_IN_THOUSANDS),
      Translate: translate,
      Logger
    });
    NumberUtils.createLanguage();
    DateUtils.setGSDateFormat(
      GlobalSettingsManager.getSettingByKey(GlobalSettingsConstants.DEFAULT_DATE_FORMAT).toUpperCase());
    return gsData;
  });
  store.dispatch({
    type: STATE_GS,
    payload: gsPromise
  });
  return gsPromise;
}

export function loadCalendar() {
  logger.log('loadCalendar');
  const id = GlobalSettingsManager.getSettingByKey(GlobalSettingsConstants.GS_DEFAULT_CALENDAR);
  const calendarPromise = CalendarHelper.findCalendarById(Number(id)).then(calendar => (calendar));
  store.dispatch({
    type: STATE_CALENDAR,
    payload: calendarPromise
  });
  return calendarPromise;
}

export function loadPossibleValuesManager() {
  logger.log('loadPossibleValuesManager');
  PossibleValuesManager.setLogger(Logger);
  return Promise.resolve();
}

/**
 * Loads FM tree, since it's a very small structure and is handy to check synchronously
 * @param id FM tree ID. If not specified, the first one will be used (Iteration 1 countries)
 */
export function loadFMTree(id = undefined) {
  logger.log('loadFMTree');
  FeatureManager.setLoggerManager(Logger);
  const fmPromise = FMHelper.findAll({ })
    .then(fmTrees => (fmTrees.length ? fmTrees[0] : null))
    .then(fmTree => {
      let tree = null;
      if (fmTree && fmTree.fmTree) {
        if (id !== undefined) {
          tree = fmTree.fmTree.find(t => t['ws-member-ids'].find(ws => ws === id))['fm-tree']['fm-settings'];
        } else {
          tree = fmTree.fmTree[0]['fm-tree']['fm-settings'];
        }
      }
      FeatureManager.setFMTree(tree);
      return tree;
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
