/** URLS */
export const URL_CONNECTIVITY_CHECK_EP = '/amp/amp-offline-version-check';
export const GET_WORKSPACES_URL = '/sync/workspaces';
export const LOGIN_URL = '/security/user';
export const GLOBAL_SETTINGS_URL = '/amp/global-settings';
export const USER_PROFILE_URL = '/security/users';
export const WORKSPACE_MEMBER_URL = '/security/workspace-member';
export const AVAILABLE_LANGUAGES_URL = '/translations/languages';
export const POST_TRANSLATIONS_URL = '/translations/translate';
export const GET_TRANSLATIONS_URL = '/sync/translations';
export const GET_FULL_EXCHANGE_RATES = '/currency/exchange-rates';
export const GET_INCREMENTAL_EXCHANGE_RATES = '/sync/exchange-rates';
export const WORKSPACE_SETTINGS_URL = '/security/workspace-settings';
export const FEATURE_MANAGER_URL = '/common/fm';
export const SYNC_URL = '/sync';
export const TEST_URL = '/test/testjsonauth';
export const ACTIVITY_IMPORT_URL = '/activity';
export const ACTIVITY_EXPORT_URL = '/activity/project';
// TODO remove as part of AMPOFFLINE-270
export const ACTIVITY_SINGLE_FIELDS_TREE_URL = '/activity/fields-no-workspace';
export const ACTIVITY_FIELDS_PER_WORKSPACE_MEMBER_URL = '/activity/ws-member-fields';
export const ACTIVITY_POSSIBLE_VALUES_PER_FIELD_PATHS = '/activity/field/values';
export const CONTACT_PULL_URL = '/contact';
export const CONTACT_PUSH_URL = '/contact';
export const CONTACT_SINGLE_FIELDS_TREE_URL = '/contact/fields';
export const CONTACT_FIELDS_PER_WORKSPACE_MEMBER_URL = '/contact/ws-member-fields';
export const CONTACT_POSSIBLE_VALUES_PER_FIELD_PATHS = '/contact/field/values';
export const RESOURCE_PULL_URL = '/resource';
export const RESOURCE_PUSH_URL = '/resource';
export const RESOURCE_SINGLE_FIELDS_TREE_URL = '/resource/fields';
export const RESOURCE_FIELDS_PER_WORKSPACE_MEMBER_URL = '/resource/ws-member-fields';
export const RESOURCE_POSSIBLE_VALUES_PER_FIELD_PATHS = '/resource/field/values';
export const DOWNLOAD_UPDATE_BINARY_URL = '/amp/amp-offline-release';
export const ELECTRON_UPDATER_CHECK_URL = '/amp/offline';
export const CHANGE_PASSWORD_URL = '/aim/showChangePassword.do';
export const RESET_PASSWORD_URL = '/aim/showEmailForm.do';
export const AMP_REGISTRY_PRODUCTION_SETTINGS_URL = 'https://amp-registry.ampsite.net/amp-registry';
export const AMP_REGISTRY_STAGING_SETTINGS_URL = 'https://amp-registry-stg.ampsite.net/amp-registry';
export const PP_SUFFIX = '/portal';
export const AMP_SUFFIX = '/aim';

/** OTHER */
export const AMP_OFFLINE_ENABLED = 'amp-offline-enabled';
export const AMP_OFFLINE_COMPATIBLE = 'amp-offline-compatible';
export const LATEST_AMP_OFFLINE = 'latest-amp-offline';
export const AMP_VERSION = 'amp-version';
export const API_SHORT_DATE_FORMAT = 'YYYY-MM-DD';
export const API_LONG_DATE_FORMAT = 'YYYY-MM-DDTHH:mm:ss.SSSZZ';
export const TRANSLATIONS_PARAM = 'translations';
export const PARAM_AMPOFFLINE_AGENT = 'AMPOffline';
export const POSSIBLE_VALUES_V2_MEDIA_TYPE = 'application/vnd.possible-values-v2+json';
export const LAST_SYNC_TIME_PARAM = 'last-sync-time';

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
