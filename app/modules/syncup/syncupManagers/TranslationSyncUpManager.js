import ConnectionHelper from '../../connectivity/ConnectionHelper';
import LanguageHelper from '../../helpers/LanguageHelper';
import {
  AVAILABLE_LANGUAGES_URL,
  GET_TRANSLATIONS_URL,
  LAST_SYNC_TIME_PARAM,
  POST_TRANSLATIONS_URL
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
import LoggerManager from '../../util/LoggerManager';
import FileManager from '../../util/FileManager';

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
    LoggerManager.log('syncUpLangList');
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
    LoggerManager.log('removeDisabledLanguageFiles');
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
    LoggerManager.log('detectSynchronizedTranslationFile');
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
    LoggerManager.log('syncUpTranslations');
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
      return this.pushTranslationsSyncUp(langIds, originalMasterTrnFile, true);
    }
  }

  /**
   * If 'isFullSync' is true this function sends text from ampoffline to AMP so these texts are marked as used on
   * ampoffline and then receives the translations. If 'isFullSync' is false then we use the function to send only
   * new texts added during development.
   * @param langIds
   * @param originalMasterTrnFile
   * @param isFullSync
   * @returns {*}
   */
  pushTranslationsSyncUp(langIds, originalMasterTrnFile, isFullSync) {
    LoggerManager.log('pushTranslationsSyncUp');
    if (isFullSync) {
      const masterTexts = Object.values(originalMasterTrnFile);
      return this.doPostCall(langIds, masterTexts).then((newTranslations) => (
        this.updateTranslationFiles(newTranslations, originalMasterTrnFile, langIds)
      ));
    } else {
      // TODO: usar getNewTranslationsDifference().
      const localTrnFileInLangDir = JSON.parse(FileManager
        .readTextDataFileSync(FS_LOCALES_DIRECTORY, `${LANGUAGE_TRANSLATIONS_FILE}.${LANGUAGE_ENGLISH}.json`));
      const diffKeys = Object.keys(originalMasterTrnFile).filter(key => localTrnFileInLangDir[key] === undefined);
      if (diffKeys.length > 0) {
        const diffTexts = diffKeys.map(k => originalMasterTrnFile[k]);
        debugger
        return this.doPostCall(langIds, diffTexts).then((newTranslations) => (
          this.updateTranslationFiles(newTranslations, originalMasterTrnFile, langIds)
        ));
      } else {
        return Promise.resolve();
      }
    }
  }

  doPostCall(langIds, textList) {
    LoggerManager.debug('doPostCall');
    return ConnectionHelper.doPost({
      shouldRetry: true,
      url: POST_TRANSLATIONS_URL,
      body: textList,
      paramsMap: { translations: langIds.join('|') }
    });
  }

  static getNewTranslationsDifference() {
    let diffTexts = null;
    // TODO: las 2 lineas siguientes se repiten en otra parte.
    const masterTrnFileName = `${LANGUAGE_MASTER_TRANSLATIONS_FILE}.${LANGUAGE_ENGLISH}.json`;
    const originalMasterTrnFile = JSON.parse(FileManager.readTextDataFileSync(FS_LOCALES_DIRECTORY, masterTrnFileName));
    if (TranslationSyncUpManager.detectSynchronizedTranslationFile(LANGUAGE_ENGLISH)) {
      const localTrnFileName = `${LANGUAGE_TRANSLATIONS_FILE}.${LANGUAGE_ENGLISH}.json`;
      const localTrnFileInLangDir = JSON.parse(FileManager
        .readTextDataFileSync(FS_LOCALES_DIRECTORY, localTrnFileName));
      const diffKeys = Object.keys(originalMasterTrnFile).filter(key => localTrnFileInLangDir[key] === undefined);
      if (diffKeys.length > 0) {
        diffTexts = diffKeys.map(k => originalMasterTrnFile[k]);
      }
    }
    return diffTexts;
  }

  /**
   * Incremental/Partial Syncup will do up to 2 calls: 1st to the POST endpoint ONLY IF the master
   * translations file has new entries NOT PRESENT in the '/lang/translations.en.json' file and
   * 2nd to the GET endpoint with last-sync-time parameter.
   * @param langIds
   * @param originalMasterTrnFile
   */
  doIncrementalSyncup(langIds, originalMasterTrnFile) {
    LoggerManager.log('doIncrementalSyncup');
    return this.pushTranslationsSyncUp(langIds, originalMasterTrnFile, false).then(() => ConnectionHelper.doGet({
      shouldRetry: true,
      url: GET_TRANSLATIONS_URL,
      paramsMap: { translations: langIds.join('|'), [LAST_SYNC_TIME_PARAM]: this._lastSyncTimestamp }
    }).then((newTranslations) => (
      this.updateTranslationFiles(newTranslations, originalMasterTrnFile, langIds)
    )));
  }

  updateTranslationFiles(newTranslations, originalMasterTrnFile, langIds) {
    LoggerManager.log('updateTranslationFiles');
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
