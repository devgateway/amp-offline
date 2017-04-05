import Backend from 'i18next-sync-fs-backend';
import fs from 'fs';
import path from 'path';
import i18next from 'i18next';
import {
  FS_LOCALES_DIRECTORY,
  LANGUAGE_ENGLISH,
  LANGUAGE_MASTER_TRANSLATIONS_FILE,
  LANGUAGE_TRANSLATIONS_FILE,
  APP_DIRECTORY
} from '../../utils/Constants';
import TranslationSyncUpManager from '../syncup/TranslationSyncUpManager';
import Notification from '../helpers/NotificationHelper';
import { NOTIFICATION_ORIGIN_SYNCUP_PROCESS } from '../../utils/constants/ErrorConstants';
import LocalizationSettings from '../../utils/LocalizationSettings';
import LoggerManager from '../../modules/util/LoggerManager';

const TranslationManager = {

  /**
   * We have to create the folder that will contain each translation file because it cant be done
   * when we package the app.
   */
  initializeLanguageDirectory() {
    LoggerManager.log('initializeLanguageDirectory');
    let langDir = '';
    let rootDir = '';
    if (process.env.NODE_ENV === 'test') {
      rootDir = `${__dirname.substring(0, __dirname.length - 'modules\\util'.length)}`;
    } else if (process.env.NODE_ENV === 'production') {
      // We cant trust __dirname at this point.
      rootDir = `${process.resourcesPath.substring(0, process.resourcesPath.length - 'resources'.length)}`;
    }
    if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'test') {
      langDir = path.resolve(rootDir, FS_LOCALES_DIRECTORY);
    } else {
      langDir = FS_LOCALES_DIRECTORY;
    }
    // Create directory.
    if (!fs.existsSync(langDir)) {
      fs.mkdirSync(langDir);
    }
    // Copy master translations file.
    const masterFileName = `${LANGUAGE_MASTER_TRANSLATIONS_FILE}.${LANGUAGE_ENGLISH}.json`;
    let masterTranslationsFileName;
    if (process.env.NODE_ENV === 'production') {
      masterTranslationsFileName = `${process.resourcesPath}/app.asar/${masterFileName}`;
    } else if (process.env.NODE_ENV === 'test') {
      masterTranslationsFileName = path.resolve(APP_DIRECTORY, masterFileName);
    } else {
      masterTranslationsFileName = path.resolve(APP_DIRECTORY, masterFileName);
    }
    const masterTranslationsFile = JSON.parse(fs.readFileSync(masterTranslationsFileName, 'utf8'));
    fs.writeFileSync(path.resolve(langDir, masterFileName), JSON.stringify(masterTranslationsFile));
  },

  getListOfLocalLanguages(restart: false) {
    LoggerManager.log('getListOfLocalLanguages');
    return new Promise((resolve, reject) => {
      const files = fs.readdirSync(FS_LOCALES_DIRECTORY);
      const langs = files.filter((item) =>
        item.match(/^((translations.)[a-z]{2}(.json))/ig)).map((item) => item.substr(13, 2));
      // We want to reinitialize the i18next module with new local transaction files.
      if (restart) {
        return this.initializeI18Next().then(() => (resolve(langs))).catch(reject);
      }
      resolve(langs);
    });
  },

  initializeI18Next() {
    LoggerManager.log('initializeI18Next');
    return new Promise((resolve, reject) => {
      const settingsFile = LocalizationSettings.getDefaultConfig();
      // Load i18n config file.
      const i18nOptions = settingsFile.I18N.OPTIONS[process.env.NODE_ENV];
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
          reject(new Notification({ message: err.toString(), origin: NOTIFICATION_ORIGIN_SYNCUP_PROCESS }));
        } else {
          resolve();
        }
      });
    });
  },

  changeLanguage(lang) {
    LoggerManager.log('changeLanguage');
    return new Promise((resolve, reject) => {
      i18next.changeLanguage(lang, (err) => {
        if (err) {
          reject(new Notification({ message: err.toString(), origin: NOTIFICATION_ORIGIN_SYNCUP_PROCESS }));
        } else {
          resolve(lang);
        }
      });
    });
  },

  removeLanguageFile(lang) {
    LoggerManager.log('removeLanguageFile');
    const file = `${FS_LOCALES_DIRECTORY}${LANGUAGE_TRANSLATIONS_FILE}.${lang}.json`;
    fs.unlink(file);
  }
};

export default TranslationManager;
