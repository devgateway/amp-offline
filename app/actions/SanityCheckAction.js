import { ipcRenderer } from 'electron';
import store from '../index';
import DatabaseSanityManager from '../modules/database/sanity/DatabaseSanityManager';
import DatabaseSanityStatus from '../modules/database/sanity/DatabaseSanityStatus';
import TranslationManager from '../modules/util/TranslationManager';
import { initLanguage, loadAllLanguages } from './TranslationAction';
import Logger from '../modules/util/LoggerManager';
import {
  CLOSE_SANITY_APP_AND_LOAD_MAIN,
  SHOW_SANITY_APP
} from '../utils/constants/ElectronAppMessages';
import { forceCloseApp } from '../modules/util/ElectronApp';
import DateUtils from '../utils/DateUtils';


const STATE_SANITY_CHECK = 'STATE_SANITY_CHECK';
export const STATE_SANITY_CHECK_FULFILLED = 'STATE_SANITY_CHECK_FULFILLED';
export const STATE_SANITY_CHECK_PENDING = 'STATE_SANITY_CHECK_PENDING';
export const STATE_SANITY_CHECK_REJECTED = 'STATE_SANITY_CHECK_REJECTED';
export const STATE_DB_HEAL_PROCEED = 'STATE_DB_HEAL_PROCEED';
export const STATE_DB_HEAL_IN_PROGRESS = 'STATE_DB_HEAL_IN_PROGRESS';
export const STATE_DB_HEAL_CANCEL = 'STATE_DB_HEAL_CANCEL';
export const STATE_DB_HEAL_COMPLETE = 'STATE_DB_HEAL_COMPLETE';
export const STATE_DB_HEAL_FAILURE_MSG_VIEWED = 'STATE_DB_HEAL_FAILURE_MSG_VIEWED';
export const STATE_DB_RESTART_SANITY_CHECK = 'STATE_DB_RESTART_SANITY_CHECK';

const logger = new Logger('SanityCheckAction');

export const restartSanityCheck = () => _doSanityCheck(true);
export const doSanityCheck = () => _doSanityCheck(false);
let start;

const _doSanityCheck = (isRestarted) => {
  logger.log('doSanityCheck');
  start = new Date();
  const sanityPromise = DatabaseSanityManager.sanityCheck()
    .then(DatabaseSanityManager.attemptTransition)
    .then((status: DatabaseSanityStatus) => {
      if (status.isDBIncompatibilityDetected && !status.isHealedSuccessfully) {
        logger.error('Database cleanup needed');
        if (isRestarted) {
          return status;
        }
        ipcRenderer.send(SHOW_SANITY_APP);
        return beforeSelfHealing().then(() => status);
      } else {
        logger.log('Cleanup not needed');
        flagCleanupComplete(true);
      }
      return status;
    });
  store.dispatch({
    type: STATE_SANITY_CHECK,
    payload: sanityPromise
  });
  return sanityPromise;
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
  console.log(`flagCleanupComplete: isStartMainApp = ${isStartMainApp}`);
  console.log(`Sanity check duration (possibly with alerts): ${DateUtils.duration(start, new Date())}`);
  if (isStartMainApp) {
    ipcRenderer.send(CLOSE_SANITY_APP_AND_LOAD_MAIN);
  } else {
    forceCloseApp();
  }
};
