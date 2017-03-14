import Backend from 'i18next-sync-fs-backend';
import fs from 'fs';
import path from 'path';
import i18next from 'i18next';
import {
  FS_LOCALES_DIRECTORY,
  LANGUAGE_ENGLISH,
  LANGUAGE_MASTER_TRANSLATIONS_FILE,
  LANGUAGE_TRANSLATIONS_FILE
} from '../../utils/Constants';
import { detectSynchronizedTranslationFile } from '../syncup/TranslationSyncUpManager';
import Notification from '../helpers/NotificationHelper';
import { NOTIFICATION_ORIGIN_SYNCUP_PROCESS } from '../../utils/constants/ErrorConstants';
import LocalizationSettings from '../../utils/LocalizationSettings';

const TranslationManager = {

  /**
   * We have to create the folder that will contain each translation file because it cant be done
   * when we package the app.
   */
  initializeLanguageDirectory() {
    console.log('initializeLanguageDirectory');
    // We cant trust __dirname at this point.
    let langDir = '';
    const rootDir = `${process.resourcesPath.substring(0, process.resourcesPath.length - 'resources'.length)}`;
    const masterFileName = `${LANGUAGE_MASTER_TRANSLATIONS_FILE}.${LANGUAGE_ENGLISH}.json`;
    if (process.env.NODE_ENV === 'production') {
      langDir = path.resolve(rootDir, FS_LOCALES_DIRECTORY);
    } else {
      langDir = FS_LOCALES_DIRECTORY;
    }
    // Create directory.
    if (!fs.existsSync(langDir)) {
      fs.mkdirSync(langDir);
    }
    // Copy master translations file.
    if (process.env.NODE_ENV === 'production') {
      const masterTranslationsFileName = `${process.resourcesPath}/app.asar/${masterFileName}`;
      const masterTranslationsFile = JSON.parse(fs.readFileSync(masterTranslationsFileName, 'utf8'));
      fs.writeFileSync(path.resolve(langDir, masterFileName), JSON.stringify(masterTranslationsFile));
    } else {
      const masterTranslationsFileName = `./app/${masterFileName}`;
      const masterTranslationsFile = JSON.parse(fs.readFileSync(masterTranslationsFileName, 'utf8'));
      fs.writeFileSync(path.resolve(FS_LOCALES_DIRECTORY, masterFileName), JSON.stringify(masterTranslationsFile));
    }
  },

  getListOfLocalLanguages(restart: false) {
    console.log('getListOfLocalLanguages');
    return new Promise((resolve, reject) => {
      const files = fs.readdirSync(FS_LOCALES_DIRECTORY);
      const langs = files.filter((item) =>
        item.match(/^((translations.)[a-z]{2}(.json))/ig)).map((item) => item.substr(13, 2));
      // We want to reinitialize the i18next module with new local transaction files.
      if (restart) {
        return this.initializeI18Next().then(resolve(langs)).catch(reject);
      }
      resolve(langs);
    });
  },

  initializeI18Next() {
    console.log('initializeI18Next');
    return new Promise((resolve, reject) => {
      const settingsFile = LocalizationSettings.getDefaultConfig();
      // Load i18n config file.
      const i18nOptions = settingsFile.I18N.OPTIONS[process.env.NODE_ENV];
      // Check if we have to use the master config file or we have sync files for translations.
      if (!detectSynchronizedTranslationFile(LANGUAGE_ENGLISH)) {
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
    console.log('changeLanguage');
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
    console.log('removeLanguageFile');
    const file = `${FS_LOCALES_DIRECTORY}${LANGUAGE_TRANSLATIONS_FILE}.${lang}.json`;
    fs.unlink(file);
  }
};

export default TranslationManager;
