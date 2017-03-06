import XHR from 'i18next-xhr-backend';
import fs from 'fs';
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

const TranslationManager = {

  getListOfLocalLanguages(restart: false) {
    console.log('getListOfLocalLanguages');
    return new Promise((resolve, reject) => {
      const files = fs.readdirSync(FS_LOCALES_DIRECTORY);
      const langs = files.filter((item) => {
        return item.match(/^((translations.)[a-z]{2}(.json))/ig);
      }).map((item) => {
        return item.substr(13, 2);
      });
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
      const settingsFile = require('../../conf/settings.json');
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
      return i18next.use(XHR).init(i18nOptions, (err, t) => {
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
      i18next.changeLanguage(lang, (err, t) => {
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
