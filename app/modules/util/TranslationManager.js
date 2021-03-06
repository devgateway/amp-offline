import Backend from 'i18next-sync-fs-backend';
import i18next from 'i18next';
import { Constants, ErrorConstants } from 'amp-ui';
import TranslationSyncUpManager from '../syncup/syncupManagers/TranslationSyncUpManager';
import Notification from '../helpers/NotificationHelper';
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
    FileManager.createDataDir(Constants.FS_LOCALES_DIRECTORY);
    // Copy master translations file.
    const masterFileName = `${Constants.LANGUAGE_MASTER_TRANSLATIONS_FILE}.${Constants.LANGUAGE_ENGLISH}.json`;
    const masterTranslationsFileName = FileManager.getFullPathForBuiltInResources(masterFileName);
    const tempTranslationFilePath = FileManager.getFullPathForBuiltInResources(Constants.FS_LOCALES_DIRECTORY);
    FileManager.copyDataFileSync(masterTranslationsFileName, Constants.FS_LOCALES_DIRECTORY, masterFileName);
    if (!isSetupComplete) {
      FileManager.readdirSyncFullPath(tempTranslationFilePath).forEach(tmpTrnFileName => {
        const matches = tmpTrnFileName.match(/^((translations\.)([a-z]{2})(.json))/);
        if (matches) {
          const fullFileName = `${tempTranslationFilePath}/${tmpTrnFileName}`;
          FileManager.copyDataFileSync(fullFileName, Constants.FS_LOCALES_DIRECTORY, matches[0]);
        }
      });
    } else {
      /* To fix AMPOFFLINE-1195 we need to add any new {key|text} pair from master-translations.en.json
      to the files in Constants.FS_LOCALES_DIRECTORY */
      const options = { encoding: 'utf-8' };
      const masterContent = JSON.parse(FileManager.readFileInPathSync(options, masterTranslationsFileName));
      const mustSyncTranslations = {};
      FileManager.readdirSync(Constants.FS_LOCALES_DIRECTORY).forEach(tmpTrnFileName => {
        const matches = tmpTrnFileName.match(/^((translations\.)([a-z]{2})(.json))/);
        if (matches) {
          const localContent = JSON.parse(FileManager.readTextDataFileSync(Constants.FS_LOCALES_DIRECTORY,
            tmpTrnFileName));
          Object.keys(masterContent).forEach(k => {
            // Only add new messages.
            if (!localContent[k]) {
              /* To fix AMPOFFLINE-1240 we will save new translations to a file that will be used on the next sync,
              * even if the EP shows nothing to sync (this happens with translations already on AMP but new for
              * Offline), if we dont resync these translations we will have old values from master-translations. */
              console.debug(`Added new trn: {${k}|${masterContent[k]}`);
              localContent[k] = masterContent[k];
              if (tmpTrnFileName.indexOf('.en.') > -1) {
                mustSyncTranslations[k] = masterContent[k];
              }
            }
          });
          FileManager.writeDataFileSync(JSON.stringify(localContent), Constants.FS_LOCALES_DIRECTORY, tmpTrnFileName);
          // To fix AMPOFFLINE-1240.
          if (Object.keys(mustSyncTranslations).length > 0 && tmpTrnFileName.indexOf('.en.') > -1) {
            FileManager.writeDataFileSync(JSON.stringify(mustSyncTranslations), Constants.FS_LOCALES_DIRECTORY,
              Constants.LANGUAGE_NEW_TRANSLATIONS_MUST_SYNC);
          }
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
    const files = FileManager.readdirSync(Constants.FS_LOCALES_DIRECTORY);
    return Array.from(new Set(files.map(item => item.match(/^(.*(translations.)([a-z]{2})(.json))/))
      .filter(item => item)
      .map(item => item[3])).values());
  },

  initializeI18Next() {
    logger.log('initializeI18Next');
    return new Promise((resolve, reject) => {
      const settingsFile = LocalizationSettings.getDefaultConfig();
      // Load i18n config file.
      const i18nOptions = settingsFile.I18N.OPTIONS[process.env.NODE_ENV];
      const loadPath = Utils.toMap('loadPath', FileManager.getFullPath(Constants.FS_LOCALES_DIRECTORY,
        '{{ns}}.{{lng}}.json'));
      i18nOptions.backend = loadPath;
      i18nOptions.preload = TranslationManager.getListOfLocales();
      // Check if we have to use the master config file or we have sync files for translations.
      if (!TranslationSyncUpManager.detectSynchronizedTranslationFile(Constants.LANGUAGE_ENGLISH)) {
        i18nOptions.ns = [Constants.LANGUAGE_MASTER_TRANSLATIONS_FILE];
        i18nOptions.defaultNS = [Constants.LANGUAGE_MASTER_TRANSLATIONS_FILE];
      } else {
        i18nOptions.ns = [Constants.LANGUAGE_TRANSLATIONS_FILE];
        i18nOptions.defaultNS = [Constants.LANGUAGE_TRANSLATIONS_FILE];
      }
      return i18next.use(Backend).init(i18nOptions, (err) => {
        if (err) {
          reject(new Notification({ message: err.toString(), origin: ErrorConstants.NOTIFICATION_ORIGIN_I18NEXT }));
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
          reject(new Notification({ message: err.toString(), origin: ErrorConstants.NOTIFICATION_ORIGIN_I18NEXT }));
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
    FileManager.deleteFileSync(FileManager.getFullPath(Constants.FS_LOCALES_DIRECTORY,
      `${Constants.LANGUAGE_TRANSLATIONS_FILE}.${lang}.json`));
  }
};

export default TranslationManager;
