import { Constants } from 'amp-ui';
import * as ConnectionHelper from '../connectivity/ConnectionHelper';
import {
  AMP_REGISTRY_PRODUCTION_SETTINGS_URL,
  AMP_REGISTRY_STAGING_SETTINGS_URL,
  TEST_URL
} from '../connectivity/AmpApiConstants';
import Notification from '../helpers/NotificationHelper';
import TranslationManager from '../util/TranslationManager';
import translate from '../../utils/translate';
import { NOTIFICATION_ORIGIN_SETUP } from '../../utils/constants/ErrorConstants';
import * as ClientSettingsHelper from '../helpers/ClientSettingsHelper';
import ConnectionInformation from '../connectivity/ConnectionInformation';
import AssetsUtils from '../../utils/AssetsUtils';
import SetupSyncUpManager from '../syncup/SetupSyncUpManager';
import * as Utils from '../../utils/Utils';
import * as CSC from '../../utils/constants/ClientSettingsConstants';
import VersionUtils from '../../utils/VersionUtils';
import AmpServer from './AmpServer';

/**
 * Setup Manager
 *
 * @author Nadejda Mandrescu
 */
const SetupManager = {

  /**
   * Checks wether setup completed or not
   * @return {Promise.<boolean>}
   */
  didSetupComplete() {
    return ClientSettingsHelper.findSettingByName(CSC.SETUP_CONFIG)
      .then(setupConfigSetting => !!(setupConfigSetting && setupConfigSetting.value));
  },

  /**
   * Gets current connection information. If USE_TEST_AMP_URL environment variable is set, then fallback to default
   * @return {Promise.<ConnectionInformation>}
   */
  getConnectionInformation() {
    return ClientSettingsHelper.findSettingByName(CSC.SETUP_CONFIG).then(setupConfigSetting => {
      const isFallbackToDefault = +process.env.USE_TEST_AMP_URL;
      const fullUrl = setupConfigSetting && setupConfigSetting.value && setupConfigSetting.value.urls[0];
      const url = fullUrl || (isFallbackToDefault && Constants.SERVER_URL) || null;
      const protocol = (!fullUrl && isFallbackToDefault && Constants.PROTOCOL) || null;
      const port = (!fullUrl && isFallbackToDefault && Constants.BASE_PORT) || null;
      return this.buildConnectionInformation(url, protocol, port, false);
    });
  },

  /**
   * Builds ConnectionInformation data
   * @param url partial or full url
   * @param protocol (optional) http or https
   * @param port (optional) e.g. 80800
   * @param isTestUrl flags if URL is used to test a connection option
   * @return {ConnectionInformation}
   */
  buildConnectionInformation(url, protocol, port, isTestUrl) {
    const isFullUrl = !(protocol || port);
    return new ConnectionInformation(
      url, Constants.BASE_REST_URL, protocol, port, Constants.CONNECTION_TIMEOUT, Constants.CONNECTION_FORCED_TIMEOUT,
      isFullUrl, isTestUrl);
  },

  buildConnectionInformationForTest(fullUrl) {
    return this.buildConnectionInformation(fullUrl, null, null, true);
  },

  buildConnectionInformationOnFullUrl(fullUrl) {
    return this.buildConnectionInformation(fullUrl, null, null, false);
  },

  testConnectivity() {
    return ConnectionHelper.doGet({ url: TEST_URL, shouldRetry: true });
  },

  /**
   * Retrieves all AMP countries setup settings from AMP Registry
   */
  getSetupOptions() {
    const registryURL = Utils.isReleaseBranch() ?
      AMP_REGISTRY_PRODUCTION_SETTINGS_URL : AMP_REGISTRY_STAGING_SETTINGS_URL;
    return ConnectionHelper.doGet({ url: registryURL, shouldRetry: true });
  },

  /**
   * @param languageList
   * @returns {AmpServer} a custom AMP Server setup option placeholder
   */
  getCustomOption(languageList: Array<string>) {
    return new AmpServer({
      id: Constants.OTHER_ID,
      name: languageList.reduce((resultMap, code) => {
        resultMap[code] = translate('Other', code);
        return resultMap;
      }, {}),
      urls: []
    });
  },

  saveSetupAndCleanup(setupConfig: AmpServer) {
    const currentUrlToUse = setupConfig.urls && setupConfig.urls.length && setupConfig.urls[0];
    if (!currentUrlToUse) {
      return Promise.reject(new Notification({
        message: translate('wrongSetup'),
        origin: NOTIFICATION_ORIGIN_SETUP
      }));
    }
    return ClientSettingsHelper.findSettingById(CSC.SETUP_CONFIG)
      .then(setupConfigSetting => {
        setupConfigSetting.value = setupConfig;
        return ClientSettingsHelper.saveOrUpdateSetting(setupConfigSetting);
      })
      .then(() => {
        // cleanup temporary setup translations
        TranslationManager.removeAllTranslationFiles();
        return TranslationManager.initializeTranslations(true);
      })
      .then(SetupSyncUpManager.syncUpMinimumData);
  },

  setDefaults(isSetupComplete) {
    AssetsUtils.setDefaultFlag();
    if (isSetupComplete) {
      return SetupSyncUpManager.syncUpMinimumData();
    }
    return Promise.resolve();
  },

  auditStartup() {
    return ClientSettingsHelper.findSettingByName(CSC.STARTUP_AUDIT_LOGS).then(logs => {
      const verAsFieldName = Utils.versionToKey();
      const currentVersionLog = logs.value[verAsFieldName] || {};
      logs.value[verAsFieldName] = currentVersionLog;

      const currentStartupTime = new Date().toISOString();
      if (!currentVersionLog[CSC.FIRST_STARTED_AT]) {
        currentVersionLog[CSC.FIRST_STARTED_AT] = currentStartupTime;
      }
      currentVersionLog[CSC.LAST_STARTED_AT] = currentStartupTime;
      return ClientSettingsHelper.saveOrUpdateSetting(logs);
    });
  },

  getCurrentVersionAuditLog() {
    return ClientSettingsHelper.findSettingByName(CSC.STARTUP_AUDIT_LOGS)
      .then(logs => logs.value[Utils.versionToKey()] || {});
  },

  getNewestVersionAuditLog() {
    let newestVerUsed = Utils.getCurrentVersion();
    return ClientSettingsHelper.findSettingByName(CSC.STARTUP_AUDIT_LOGS)
      .then(logs => {
        Object.keys(logs.value).forEach(ver => {
          const verFromAudit = Utils.versionFromKey(ver);
          if (VersionUtils.compareVersion(verFromAudit, newestVerUsed) > 0) {
            newestVerUsed = verFromAudit;
          }
        });
        return newestVerUsed;
      });
  },
};

export default SetupManager;
