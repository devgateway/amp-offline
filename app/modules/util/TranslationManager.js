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
   * We have to create the folder that will contain each translation file because it cant be done
   * when we package the app.
   */
  initializeLanguageDirectory() {
    console.log('initializeLanguageDirectory');
    FileManager.createDataDir(FS_LOCALES_DIRECTORY);
    // Copy master translations file.
    const masterFileName = `${LANGUAGE_MASTER_TRANSLATIONS_FILE}.${LANGUAGE_ENGLISH}.json`;
    let masterTranslationsFileName;
    if (process.env.NODE_ENV === 'production') {
      masterTranslationsFileName = `${process.resourcesPath}/app.asar/${masterFileName}`;
    } else if (process.env.NODE_ENV === 'test') {
      masterTranslationsFileName = FileManager.getFullPath(APP_DIRECTORY, masterFileName);
    } else {
      masterTranslationsFileName = FileManager.getFullPath(APP_DIRECTORY, masterFileName);
    }
    FileManager.copyDataFileSync(masterTranslationsFileName, FS_LOCALES_DIRECTORY, masterFileName);
  },

  getListOfLocalLanguages(restart: false) {
    logger.log('getListOfLocalLanguages');
    return new Promise((resolve, reject) => {
      const files = FileManager.readdirSync(FS_LOCALES_DIRECTORY);
      const langs = Array.from(new Set(files.map(item => item.match(/^(.*(translations.)([a-z]{2})(.json))/))
        .map(item => item[3])).values());
      // We want to reinitialize the i18next module with new local transaction files.
      if (restart) {
        logger.log('getListOfLocalLanguages:restart');
        return this.initializeI18Next().then(() => (resolve(langs))).catch(reject);
      }
      logger.log('getListOfLocalLanguages:resolve');
      resolve(langs);
    });
  },

  initializeI18Next() {
    logger.log('initializeI18Next');
    return new Promise((resolve, reject) => {
      const settingsFile = LocalizationSettings.getDefaultConfig();
      // Load i18n config file.
      const i18nOptions = settingsFile.I18N.OPTIONS[process.env.NODE_ENV];
      const loadPath = Utils.toMap('loadPath', FileManager.getFullPath(FS_LOCALES_DIRECTORY, '{{ns}}.{{lng}}.json'));
      i18nOptions.backend = loadPath;
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

  removeLanguageFile(lang) {
    logger.log('removeLanguageFile');
    FileManager.deleteFile(FileManager.getFullPath(FS_LOCALES_DIRECTORY, `${LANGUAGE_TRANSLATIONS_FILE}.${lang}.json`));
  }
};

export default TranslationManager;
