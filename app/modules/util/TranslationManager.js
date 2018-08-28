import Backend from 'i18next-sync-fs-backend';
import i18next from 'i18next';
import {
  APP_DIRECTORY,
  FS_LOCALES_DIRECTORY,
  LANGUAGE_ENGLISH,
  LANGUAGE_MASTER_TRANSLATIONS_FILE,
  LANGUAGE_TRANSLATIONS_FILE
} from '../../utils/Constants';
import TranslationSyncUpManager from '../syncup/syncupManagers/TranslationSyncUpManager';
import Notification from '../helpers/NotificationHelper';
import { NOTIFICATION_ORIGIN_I18NEXT } from '../../utils/constants/ErrorConstants';
import LocalizationSettings from '../../utils/LocalizationSettings';
import Logger from '../../modules/util/LoggerManager';
import FileManager from './FileManager';
import * as Utils from '../../utils/Utils';

const logger = new Logger('Translation manager');

const TranslationManager = {

  /**
   * Initializes translations
   * @param isSetupComplete
   * @return {*}
   */
  initializeTranslations(isSetupComplete) {
    this.initializeLanguageDirectory(isSetupComplete);
    return this.initializeI18Next();
  },

  /**
   * We have to create the folder that will contain each translation file because it cant be done
   * when we package the app.
   */
  initializeLanguageDirectory(isSetupComplete) {
    console.log('initializeLanguageDirectory');
    FileManager.createDataDir(FS_LOCALES_DIRECTORY);
    // Copy master translations file.
    const masterFileName = `${LANGUAGE_MASTER_TRANSLATIONS_FILE}.${LANGUAGE_ENGLISH}.json`;
    let masterTranslationsFileName = FileManager.getFullPath(APP_DIRECTORY, masterFileName);
    let tempTranslationFilePath = FileManager.getFullPath(APP_DIRECTORY, FS_LOCALES_DIRECTORY);
    if (process.env.NODE_ENV === 'production') {
      masterTranslationsFileName = `${process.resourcesPath}/app.asar/${masterFileName}`;
      tempTranslationFilePath = `${process.resourcesPath}/app.asar/${FS_LOCALES_DIRECTORY}`;
    }
    FileManager.copyDataFileSync(masterTranslationsFileName, FS_LOCALES_DIRECTORY, masterFileName);
    if (!isSetupComplete) {
      FileManager.readdirSyncFullPath(tempTranslationFilePath).forEach(tmpTrnFileName => {
        const matches = tmpTrnFileName.match(/^((translations\.)([a-z]{2})(.json))/);
        if (matches) {
          const fullFileName = `${tempTranslationFilePath}/${tmpTrnFileName}`;
          FileManager.copyDataFileSync(fullFileName, FS_LOCALES_DIRECTORY, matches[0]);
        }
      });
    }
  },

  getListOfLocalLanguages(restart: false) {
    logger.log('getListOfLocalLanguages');
    return new Promise((resolve, reject) => {
      const langs = TranslationManager.getListOfLocales();
      // We want to reinitialize the i18next module with new local transaction files.
      if (restart) {
        return this.initializeI18Next().then(() => (resolve(langs))).catch(reject);
      }
      resolve(langs);
    });
  },

  getListOfLocales() {
    const files = FileManager.readdirSync(FS_LOCALES_DIRECTORY);
    return Array.from(new Set(files.map(item => item.match(/^(.*(translations.)([a-z]{2})(.json))/))
      .map(item => item[3])).values());
  },

  initializeI18Next() {
    logger.log('initializeI18Next');
    return new Promise((resolve, reject) => {
      const settingsFile = LocalizationSettings.getDefaultConfig();
      // Load i18n config file.
      const i18nOptions = settingsFile.I18N.OPTIONS[process.env.NODE_ENV];
      const loadPath = Utils.toMap('loadPath', FileManager.getFullPath(FS_LOCALES_DIRECTORY, '{{ns}}.{{lng}}.json'));
      i18nOptions.backend = loadPath;
      i18nOptions.preload = TranslationManager.getListOfLocales();
      // Check if we have to use the master config file or we have sync files for translations.
      if (!TranslationSyncUpManager.detectSynchronizedTranslationFile(LANGUAGE_ENGLISH)) {
        i18nOptions.ns = [LANGUAGE_MASTER_TRANSLATIONS_FILE];
        i18nOptions.defaultNS = [LANGUAGE_MASTER_TRANSLATIONS_FILE];
      } else {
        i18nOptions.ns = [LANGUAGE_TRANSLATIONS_FILE];
        i18nOptions.defaultNS = [LANGUAGE_TRANSLATIONS_FILE];
      }
      return i18next.use(Backend).init(i18nOptions, (err) => {
        if (err) {
          reject(new Notification({ message: err.toString(), origin: NOTIFICATION_ORIGIN_I18NEXT }));
        } else {
          resolve();
        }
      });
    });
  },

  changeLanguage(lang) {
    logger.log('changeLanguage');
    return new Promise((resolve, reject) => {
      i18next.changeLanguage(lang, (err) => {
        if (err) {
          reject(new Notification({ message: err.toString(), origin: NOTIFICATION_ORIGIN_I18NEXT }));
        } else {
          resolve(lang);
        }
      });
    });
  },

  removeAllTranslationFiles() {
    this.getListOfLocales().forEach(lang => this.removeLanguageFile(lang));
  },

  removeLanguageFile(lang) {
    logger.log('removeLanguageFile');
    FileManager.deleteFileSync(FileManager.getFullPath(FS_LOCALES_DIRECTORY, `${LANGUAGE_TRANSLATIONS_FILE}.${lang}.json`));
  }
};

export default TranslationManager;
