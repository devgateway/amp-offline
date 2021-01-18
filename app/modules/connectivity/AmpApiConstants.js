/** URLS */
export const URL_CONNECTIVITY_CHECK_EP = '/amp/amp-offline-version-check';
export const GET_WORKSPACES_URL = '/sync/workspaces';
export const LOGIN_URL = '/security/user';
export const GLOBAL_SETTINGS_URL = '/amp/global-settings';
export const USER_PROFILE_URL = '/security/users';
export const WORKSPACE_MEMBER_URL = '/security/workspace-member';
export const AVAILABLE_LANGUAGES_URL = '/translations/languages';
export const POST_TRANSLATIONS_URL = '/translations/translateWithPrefix';
export const GET_TRANSLATIONS_URL = '/sync/translationsWithPrefix';
export const GET_FULL_EXCHANGE_RATES = '/currency/exchange-rates';
export const GET_INCREMENTAL_EXCHANGE_RATES = '/sync/exchange-rates';
export const WORKSPACE_SETTINGS_URL = '/security/workspace-settings';
export const FEATURE_MANAGER_URL = '/common/fm';
export const FEATURE_MANAGER_BY_WS_URL = '/common/fm-by-ws-member';
export const SYNC_URL = '/sync';
export const TEST_URL = '/test/testjsonauth';
export const ACTIVITY_IMPORT_URL = '/activity';
export const ACTIVITY_EXPORT_URL = '/activity/project';
export const ACTIVITY_EXPORT_BATCHES_URL = '/activity/projects';
export const GAZETTEER_URL = '/gis/locators';
export const ACTIVITY_FIELDS_PER_WORKSPACE_MEMBER_URL = '/activity/ws-member-fields';
export const ACTIVITY_POSSIBLE_VALUES_PER_FIELD_PATHS = '/activity/field/values';
export const CONTACT_PULL_URL = '/contact';
export const CONTACT_BATCHES_PULL_URL = '/contact/batch';
export const CONTACT_PUSH_URL = '/contact';
export const CONTACT_SINGLE_FIELDS_TREE_URL = '/contact/fields';
export const CONTACT_FIELDS_PER_WORKSPACE_MEMBER_URL = '/contact/ws-member-fields';
export const CONTACT_POSSIBLE_VALUES_PER_FIELD_PATHS = '/contact/field/values';
export const RESOURCE_PULL_URL = '/resource';
export const RESOURCE_PUSH_URL = '/resource';
export const RESOURCE_SINGLE_FIELDS_TREE_URL = '/resource/fields';
export const RESOURCE_FIELDS_PER_WORKSPACE_MEMBER_URL = '/resource/ws-member-fields';
export const RESOURCE_POSSIBLE_VALUES_PER_FIELD_PATHS = '/resource/field/values';
export const COMMON_POSSIBLE_VALUES_PER_FIELD_PATHS = '/common/field/values';
export const CALENDAR_PULL_URL = '/calendar';
export const DOWNLOAD_UPDATE_BINARY_URL = '/amp/amp-offline-release';
export const ELECTRON_UPDATER_CHECK_URL = '/amp/offline';
export const CHANGE_PASSWORD_URL = '/aim/showChangePassword.do';
export const RESET_PASSWORD_URL = '/aim/showEmailForm.do';
export const AMP_REGISTRY_PRODUCTION_SETTINGS_URL = 'https://amp-registry.ampsite.net/amp-registry';
export const AMP_REGISTRY_STAGING_SETTINGS_URL = 'https://amp-registry-stg.ampsite.net/amp-registry';
export const PP_SUFFIX = '/portal';
export const AMP_SUFFIX = '/aim';
export const ACTIVITY_PUBLIC_FIELD_VALUES = '/activity/field/values/public';

/** OTHER */
export const AMP_OFFLINE_ENABLED = 'amp-offline-enabled';
export const AMP_OFFLINE_COMPATIBLE = 'amp-offline-compatible';
export const LATEST_AMP_OFFLINE = 'latest-amp-offline';
export const AMP_VERSION = 'amp-version';
export const AMP_SERVER_ID = 'server-id';
export const AMP_SERVER_ID_MATCH = 'server-id-match';
export const TRANSLATIONS_PARAM = 'translations';
export const LANGUAGE_PARAM = 'language';
export const PARAM_AMPOFFLINE_AGENT = 'AMPOffline';
export const POSSIBLE_VALUES_V2_MEDIA_TYPE = 'application/vnd.possible-values-v2+json';
export const LAST_SYNC_TIME_PARAM = 'last-sync-time';
export const AMP_ERROR_NO_ERROR = 'AMP_ERROR_NO_ERROR';
export const AMP_ERROR_NOT_AVAILABLE = 'AMP_ERROR_NOT_AVAILABLE';
export const AMP_ERROR_NO_SERVER_ID = 'AMP_ERROR_NO_SERVER_ID';
export const AMP_ERROR_SERVER_ID_MISMATCH = 'AMP_ERROR_SERVER_ID_MISMATCH';
export const AMP_ERROR_NOT_COMPATIBLE = 'AMP_ERROR_NOT_COMPATIBLE';
export const AMP_ERROR_OFFLINE_DISABLED = 'AMP_ERROR_OFFLINE_DISABLED';
export const AMP_ERRORS_BY_PRIORITY_ASC = [AMP_ERROR_NO_ERROR, AMP_ERROR_OFFLINE_DISABLED, AMP_ERROR_NOT_COMPATIBLE,
  AMP_ERROR_SERVER_ID_MISMATCH, AMP_ERROR_NO_SERVER_ID, AMP_ERROR_NOT_AVAILABLE];
export const AMP_ERRORS_BY_PRIORITY_DESC = AMP_ERRORS_BY_PRIORITY_ASC.slice().reverse();

export const AMP_COUNTRY_FLAG = '/aim/default/displayFlag.do';
export const MAP_TILES_URL = '/gis/map-tiles';

export const DOWNLOAD_UPGRADE_URL = '/amp/download-upgrade'; // TODO: this url will change for sure.
export const PLATFORM_WINDOWS = 'windows';
export const PLATFORM_MAC_OS = 'osx';
export const PLATFORM_REDHAT = 'redhat';
export const PLATFORM_DEBIAN = 'debian';

export const ARCH64 = '64';
export const ARCH32 = '32';
export const ARCH64_NODE_OS_OPTIONS = new Set(['arm64', 'ppc64', 'x64']);
export const ARCH64_USER_AGENT_OPTIONS = ['x86_64', 'amd64'];

export const RESPONSE_CHECK_INTERVAL_MS = 100;

export const API_ERROR_TO_AMP_OFFLINE_ERROR_BY_CODE = {
  '0004': {
    '(Not allowed) AMP Offline is not compatible': 'ampServerIncompatibleContinueToUse'
  }
};
