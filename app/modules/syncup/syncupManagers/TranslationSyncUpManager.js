import { Constants, ErrorConstants } from 'amp-ui';
import ConnectionHelper from '../../connectivity/ConnectionHelper';
import LanguageHelper from '../../helpers/LanguageHelper';
import {
  AVAILABLE_LANGUAGES_URL,
  GET_TRANSLATIONS_URL,
  LAST_SYNC_TIME_PARAM,
  POST_TRANSLATIONS_URL
} from '../../connectivity/AmpApiConstants';
import Notification from '../../helpers/NotificationHelper';
import TranslationManager from '../../util/TranslationManager';
import SyncUpManagerInterface from './SyncUpManagerInterface';
import Logger from '../../util/LoggerManager';
import FileManager from '../../util/FileManager';

const logger = new Logger('Translations syncup manager');

/* eslint-disable class-methods-use-this */

export default class TranslationSyncUpManager extends SyncUpManagerInterface {

  // TODO partial sync up once partial sync up is possible for translations. For now it will be as an atomic one.
  constructor() {
    super(Constants.SYNCUP_TYPE_TRANSLATIONS);
    this.done = false;
  }

  /**
   * Check if we have a valid translations file for a given language.
   * @param lang
   * @returns {boolean}
   */
  static detectSynchronizedTranslationFile(lang) {
    logger.log('detectSynchronizedTranslationFile');
    let ret = false;
    const stats = FileManager.statSync(Constants.FS_LOCALES_DIRECTORY,
      `${Constants.LANGUAGE_TRANSLATIONS_FILE}.${lang}.json`);
    if (stats) {
      const fileSize = stats.size;
      if (fileSize > 10) { // Just to test the file has something in it.
        ret = true;
      }
    }
    return ret;
  }

  static parseMasterTrnFile() {
    const masterTrnFileName = `${Constants.LANGUAGE_MASTER_TRANSLATIONS_FILE}.${Constants.LANGUAGE_ENGLISH}.json`;
    return JSON.parse(FileManager.readTextDataFileSync(Constants.FS_LOCALES_DIRECTORY, masterTrnFileName));
  }

  /**
   * Return new texts or the whole file in case of full sync.
   * @returns {*}
   */
  static getNewTranslationsDifference() {
    let diffTexts = [];
    const originalMasterTrnFile = TranslationSyncUpManager.parseMasterTrnFile();
    if (TranslationSyncUpManager.detectSynchronizedTranslationFile(Constants.LANGUAGE_ENGLISH)) {
      const localTrnFileName = `${Constants.LANGUAGE_TRANSLATIONS_FILE}.${Constants.LANGUAGE_ENGLISH}.json`;
      const localTrnFileInLangDir = JSON.parse(FileManager
        .readTextDataFileSync(Constants.FS_LOCALES_DIRECTORY, localTrnFileName));
      const diffKeys = Object.keys(originalMasterTrnFile).filter(key => localTrnFileInLangDir[key] === undefined);
      if (diffKeys.length > 0) {
        diffTexts = diffKeys.map(k => originalMasterTrnFile[k]);
      }
      if (FileManager.existsSync(Constants.FS_LOCALES_DIRECTORY, Constants.LANGUAGE_NEW_TRANSLATIONS_MUST_SYNC)) {
        const must = JSON
          .parse(FileManager.readTextDataFileSync(Constants.FS_LOCALES_DIRECTORY,
            Constants.LANGUAGE_NEW_TRANSLATIONS_MUST_SYNC));
        Object.keys(must).forEach(k => {
          diffTexts.push(k);
        });
      }
    } else {
      diffTexts = Object.values(originalMasterTrnFile);
    }
    return diffTexts;
  }

  doSyncUp() {
    this.done = false;
    return this.syncUpLangList().then((result) => {
      this.done = true;
      // After sucessfull sync remove must-sync translations file.
      FileManager.deleteFileSync(FileManager.getFullPath(Constants.FS_LOCALES_DIRECTORY,
        Constants.LANGUAGE_NEW_TRANSLATIONS_MUST_SYNC));
      return result;
    });
  }

  getDiffLeftover() {
    return this.done !== true;
  }

  cancel() {
    // TODO
  }

  syncUpLangList() {
    logger.log('syncUpLangList');
    return new Promise((resolve, reject) => (
      ConnectionHelper.doGet({ url: AVAILABLE_LANGUAGES_URL, shouldRetry: true }).then((langs) => (
        // Replace the list of available languages first.
        LanguageHelper.replaceCollection(langs).then(() => {
          // Delete removed language files if needed (it can happen!).
          const langIds = langs.map(value => value.id);
          return this.removeDisabledLanguageFiles(langIds).then(() => (
            // Now sync translations for all languages at once.
            this.syncUpTranslations(langs).then(() => (resolve(langs))).catch(reject)
          )).catch(reject);
        }).catch(reject)
      )).catch(reject)
    ));
  }

  removeDisabledLanguageFiles(langs) {
    logger.log('removeDisabledLanguageFiles');
    const restart = false;
    return new Promise((resolve, reject) => (
      TranslationManager.getListOfLocalLanguages(restart).then((existingLangs) => {
        const toDelete = existingLangs.filter((item) => langs.indexOf(item) === -1);
        toDelete.forEach((item) => (
          TranslationManager.removeLanguageFile(item)
        ));
        return resolve();
      }).catch(reject)
    ));
  }

  // TODO: use lastSyncDate when calling the EP.
  syncUpTranslations(langs) {
    logger.log('syncUpTranslations');
    const originalMasterTrnFile = TranslationSyncUpManager.parseMasterTrnFile();
    const langIds = langs.map(value => value.id);
    /* In the first syncup we send all translations to the POST endpoint and for incremental syncups we call
     the GET endpoint. In both cases we will match the response with the "original text" from the master-file,
     not with the "key". */
    const everyLangHasSync = langIds.reduce((prev, current) =>
      (prev && TranslationSyncUpManager.detectSynchronizedTranslationFile(current)), true);
    if (everyLangHasSync) {
      // Do incremental syncup.
      return this.doIncrementalSyncup(langIds, originalMasterTrnFile);
    } else {
      // Do full syncup.
      return this.pushTranslationsSyncUp(langIds, originalMasterTrnFile);
    }
  }

  /**
   * If 'is full sync' this function sends all text from ampoffline to AMP so these texts are marked as used on
   * ampoffline and then receives the translations. Else we use the function to send only
   * new texts added during development.
   * @param langIds
   * @param originalMasterTrnFile
   * @returns {*}
   */
  pushTranslationsSyncUp(langIds, originalMasterTrnFile) {
    logger.log('pushTranslationsSyncUp');
    // On full sync diffTexts is the complete originalMasterTrnFile.
    const diffTexts = TranslationSyncUpManager.getNewTranslationsDifference();
    if (diffTexts.length > 0) {
      return this.doPostCall(langIds, diffTexts).then((newTranslations) => (
        this.updateTranslationFiles(newTranslations, originalMasterTrnFile, langIds)
      ));
    } else {
      return Promise.resolve();
    }
  }

  doPostCall(langIds, textList) {
    logger.debug('doPostCall');
    return ConnectionHelper.doPost({
      shouldRetry: true,
      url: POST_TRANSLATIONS_URL,
      body: textList,
      paramsMap: { translations: langIds.join('|') }
    });
  }

  /**
   * Incremental/Partial Syncup will do up to 2 calls: 1st to the POST endpoint ONLY IF the master
   * translations file has new entries NOT PRESENT in the '/lang/translations.en.json' file and
   * 2nd to the GET endpoint with last-sync-time parameter.
   * @param langIds
   * @param originalMasterTrnFile
   */
  doIncrementalSyncup(langIds, originalMasterTrnFile) {
    logger.log('doIncrementalSyncup');
    if (!this._lastSyncTimestamp) {
      // this for the first time sync up since we do full syncup of translations during setup for better UX
      logger.warn('Skipping incremental sync up since no timestamp available yet. Should be the first sync up.');
      return Promise.resolve();
    }
    return this.pushTranslationsSyncUp(langIds, originalMasterTrnFile).then(() => ConnectionHelper.doGet({
      shouldRetry: true,
      url: GET_TRANSLATIONS_URL,
      paramsMap: { translations: langIds.join('|'), [LAST_SYNC_TIME_PARAM]: this._lastSyncTimestamp }
    }).then((newTranslations) => (
      this.updateTranslationFiles(newTranslations, originalMasterTrnFile, langIds)
    )));
  }

  updateTranslationFiles(newTranslations, originalMasterTrnFile, langIds) {
    logger.log('updateTranslationFiles');
    const prefixes = Object.keys(newTranslations);
    const fn = (lang) => {
      // We might need access to previous translations for this language.
      const oldTranslationFileExists = TranslationSyncUpManager.detectSynchronizedTranslationFile(lang);
      let oldTrnFile;
      if (oldTranslationFileExists) {
        oldTrnFile = JSON.parse(FileManager
          .readTextDataFileSync(Constants.FS_LOCALES_DIRECTORY,
            `${Constants.LANGUAGE_TRANSLATIONS_FILE}.${lang}.json`));
      }
      const copyMasterTrnFile = Object.assign({}, originalMasterTrnFile);
      return new Promise((resolve, reject) => {
        if (prefixes.length === 0) {
          return resolve();
        }
        // Iterate the master-file copy and look for translations on this language.
        Object.keys(copyMasterTrnFile).forEach(key => {
          const textFromMaster = copyMasterTrnFile[key];
          prefixes.forEach(prefix => {
            const keyWithPrefix = `${key}---${prefix}`;
            const newTextObject = newTranslations[prefix][textFromMaster];
            if (newTextObject && newTextObject[lang]) {
              copyMasterTrnFile[keyWithPrefix] = newTextObject[lang];
            } else if (oldTranslationFileExists && oldTrnFile[key]) {
              // Check if we have a previous translation and use it.
              // Also we need to use the new key or the old one in case is the first sync.
              copyMasterTrnFile[keyWithPrefix] = oldTrnFile[keyWithPrefix] || oldTrnFile[key];
            }
          });
        });
        // copyMasterTrnFile = this.cleanupKeysWithoutPrefix(copyMasterTrnFile, prefixes);

        // Overwrite local file for this language with the new translations from server.
        const localTrnFile = `${Constants.LANGUAGE_TRANSLATIONS_FILE}.${lang}.json`;
        return FileManager.writeDataFile(JSON.stringify(copyMasterTrnFile),
          Constants.FS_LOCALES_DIRECTORY, localTrnFile)
          .then(() => resolve(copyMasterTrnFile))
          .catch(err =>
            reject(new Notification(
              { message: err.toString(), origin: ErrorConstants.NOTIFICATION_ORIGIN_SYNCUP_PROCESS }))
          );
      });
    };

    // If we have more than one language we make the process in parallel to save time.
    const promises = langIds.map(fn);
    return Promise.all(promises);
  }

  cleanupKeysWithoutPrefix(trnFile, prefixes) {
    Object.keys(trnFile).forEach(key => {
      if (!prefixes.find(p => key.indexOf(p) > -1)) {
        delete trnFile[key];
      }
    });
    return trnFile;
  }
}
