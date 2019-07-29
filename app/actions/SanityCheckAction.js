import { ipcRenderer } from 'electron';
import store from '../index';
import DatabaseSanityManager from '../modules/database/sanity/DatabaseSanityManager';
import DatabaseSanityStatus from '../modules/database/sanity/DatabaseSanityStatus';
import TranslationManager from '../modules/util/TranslationManager';
import { initLanguage, loadAllLanguages } from './TranslationAction';
import Logger from '../modules/util/LoggerManager';
import {
  CLOSE_SANITY_APP,
  FORCE_CLOSE_APP,
  SHOW_SANITY_APP,
  START_MAIN_APP
} from '../utils/constants/ElectronAppMessages';


const STATE_SANITY_CHECK = 'STATE_SANITY_CHECK';
export const STATE_SANITY_CHECK_FULFILLED = 'STATE_SANITY_CHECK_FULFILLED';
export const STATE_SANITY_CHECK_PENDING = 'STATE_SANITY_CHECK_PENDING';
export const STATE_SANITY_CHECK_REJECTED = 'STATE_SANITY_CHECK_REJECTED';
export const STATE_DB_HEAL_PROCEED = 'STATE_DB_HEAL_PROCEED';
export const STATE_DB_HEAL_IN_PROGRESS = 'STATE_DB_HEAL_IN_PROGRESS';
export const STATE_DB_HEAL_CANCEL = 'STATE_DB_HEAL_CANCEL';
export const STATE_DB_HEAL_COMPLETE = 'STATE_DB_HEAL_COMPLETE';
export const STATE_DB_HEAL_FAILURE_MSG_VIEWED = 'STATE_DB_HEAL_FAILURE_MSG_VIEWED';


const logger = new Logger('SanityCheckAction');

export const doSanityCheck = () => {
  logger.log('doSanityCheck');
  const sanityPromise = DatabaseSanityManager.sanityCheck();
  store.dispatch({
    type: STATE_SANITY_CHECK,
    payload: sanityPromise
  });
  return sanityPromise.then((status: DatabaseSanityStatus) => {
    if (status.isDBIncompatibilityDetected && !status.isHealedSuccessfully) {
      logger.error('Database is corrupted');
      ipcRenderer.send(SHOW_SANITY_APP);
      return beforeSelfHealing().then(() => status);
    } else {
      logger.log('Cleanup not needed');
      flagCleanupComplete(true);
    }
    return status;
  });
};

const beforeSelfHealing = () => {
  logger.log('beforeSelfHealing');
  return TranslationManager.initializeTranslations(false)
    .then(result => {
      store.dispatch(loadAllLanguages());
      store.dispatch(initLanguage());
      return result;
    });
};

export const doDBCleanup = (sanityStatus) => {
  logger.log('doDBCleanup');
  store.dispatch({ type: STATE_DB_HEAL_IN_PROGRESS });
  return DatabaseSanityManager.cleanupDB(sanityStatus).then(result => {
    store.dispatch({ type: STATE_DB_HEAL_COMPLETE });
    return result;
  });
};

export const cancelDBCleanup = (sanityStatus) => {
  logger.log('cancelDBCleanup');
  return DatabaseSanityManager.cancelDBCleanup(sanityStatus).then(result => {
    flagCleanupComplete(false);
    return result;
  });
};

export const flagCleanupComplete = (isStartMainApp) => {
  logger.log(`flagCleanupComplete: isStartMainApp = ${isStartMainApp}`);
  ipcRenderer.send(CLOSE_SANITY_APP);
  if (isStartMainApp) {
    ipcRenderer.send(START_MAIN_APP);
  } else {
    ipcRenderer.send(FORCE_CLOSE_APP);
  }
};