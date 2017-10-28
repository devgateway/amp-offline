import ConnectionHelper from '../../connectivity/ConnectionHelper';
import LanguageHelper from '../../helpers/LanguageHelper';
import {
  AVAILABLE_LANGUAGES_URL,
  GET_TRANSLATIONS_URL,
  POST_TRANSLATIONS_URL,
  LAST_SYNC_TIME_PARAM
} from '../../connectivity/AmpApiConstants';
import {
  FS_LOCALES_DIRECTORY,
  LANGUAGE_ENGLISH,
  LANGUAGE_MASTER_TRANSLATIONS_FILE,
  LANGUAGE_TRANSLATIONS_FILE,
  SYNCUP_TYPE_TRANSLATIONS
} from '../../../utils/Constants';
import Notification from '../../helpers/NotificationHelper';
import { NOTIFICATION_ORIGIN_SYNCUP_PROCESS } from '../../../utils/constants/ErrorConstants';
import TranslationManager from '../../util/TranslationManager';
import SyncUpManagerInterface from './SyncUpManagerInterface';
import Logger from '../../util/LoggerManager';
import FileManager from '../../util/FileManager';

const logger = new Logger('Translations syncup manager');

/* eslint-disable class-methods-use-this */

export default class TranslationSyncUpManager extends SyncUpManagerInterface {

  // TODO partial sync up once partial sync up is possible for translations. For now it will be as an atomic one.
  constructor() {
    super(SYNCUP_TYPE_TRANSLATIONS);
    this.done = false;
  }

  doSyncUp() {
    this.done = false;
    return this.syncUpLangList().then((result) => {
      this.done = true;
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

  /**
   * Check if we have a valid translations file for a given language.
   * @param lang
   * @returns {boolean}
   */
  static detectSynchronizedTranslationFile(lang) {
    logger.log('detectSynchronizedTranslationFile');
    let ret = false;
    const stats = FileManager.statSync(FS_LOCALES_DIRECTORY, `${LANGUAGE_TRANSLATIONS_FILE}.${lang}.json`);
    if (stats) {
      const fileSize = stats.size;
      if (fileSize > 10) { // Just to test the file has something in it.
        ret = true;
      }
    }
    return ret;
  }

  // TODO: use lastSyncDate when calling the EP.
  syncUpTranslations(langs) {
    logger.log('syncUpTranslations');
    const masterTrnFileName = `${LANGUAGE_MASTER_TRANSLATIONS_FILE}.${LANGUAGE_ENGLISH}.json`;
    const originalMasterTrnFile = JSON.parse(FileManager.readTextDataFileSync(FS_LOCALES_DIRECTORY, masterTrnFileName));
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
      return this.doFullSyncUp(langIds, originalMasterTrnFile);
    }
  }

  doFullSyncUp(langIds, originalMasterTrnFile) {
    logger.log('doFullSyncUp');
    // Extract text to translate from our master-file.
    const masterTexts = Object.values(originalMasterTrnFile);
    return ConnectionHelper.doPost({
      shouldRetry: true,
      url: POST_TRANSLATIONS_URL,
      body: masterTexts,
      paramsMap: { translations: langIds.join('|') }
    }).then((newTranslations) => (
      this.updateTranslationFiles(newTranslations, originalMasterTrnFile, langIds)
    ));
  }

  doIncrementalSyncup(langIds, originalMasterTrnFile) {
    logger.log('doIncrementalSyncup');
    return ConnectionHelper.doGet({
      shouldRetry: true,
      url: GET_TRANSLATIONS_URL,
      paramsMap: { translations: langIds.join('|'), [LAST_SYNC_TIME_PARAM]: this._lastSyncTimestamp }
    }).then((newTranslations) => (
      this.updateTranslationFiles(newTranslations, originalMasterTrnFile, langIds)
    ));
  }

  updateTranslationFiles(newTranslations, originalMasterTrnFile, langIds) {
    logger.log('updateTranslationFiles');
    const fn = (lang) => {
      // We might need access to previous translations for this language.
      const oldTranslationFileExists = TranslationSyncUpManager.detectSynchronizedTranslationFile(lang);
      let oldTrnFile;
      if (oldTranslationFileExists) {
        oldTrnFile = JSON.parse(FileManager
          .readTextDataFileSync(FS_LOCALES_DIRECTORY, `${LANGUAGE_TRANSLATIONS_FILE}.${lang}.json`));
      }
      const copyMasterTrnFile = Object.assign({}, originalMasterTrnFile);
      return new Promise((resolve, reject) => {
        // Iterate the master-file copy and look for translations on this language.
        Object.keys(copyMasterTrnFile).forEach(key => {
          const textFromMaster = copyMasterTrnFile[key];
          const newTextObject = newTranslations[textFromMaster];
          if (newTextObject && newTextObject[lang]) {
            copyMasterTrnFile[key] = newTextObject[lang];
          } else if (oldTranslationFileExists && oldTrnFile[key]) {
            // Check if we have a previous translation and use it.
            copyMasterTrnFile[key] = oldTrnFile[key];
          }
        });

        // Overwrite local file for this language with the new translations from server.
        const localTrnFile = `${LANGUAGE_TRANSLATIONS_FILE}.${lang}.json`;
        return FileManager.writeDataFile(JSON.stringify(copyMasterTrnFile), FS_LOCALES_DIRECTORY, localTrnFile)
          .then(() => resolve(copyMasterTrnFile))
          .catch(err =>
            reject(new Notification({ message: err.toString(), origin: NOTIFICATION_ORIGIN_SYNCUP_PROCESS }))
          );
      });
    };

    // If we have more than one language we make the process in parallel to save time.
    const promises = langIds.map(fn);
    return Promise.all(promises);
  }
}
