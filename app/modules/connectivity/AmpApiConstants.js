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
export const SINGLE_FIELDS_TREE_URL = '/activity/fields-no-workspace';
export const FIELDS_PER_WORKSPACE_MEMBER_URL = '/activity/ws-member-fields';
export const POSSIBLE_VALUES_PER_FIELD_PATHS = '/activity/field/values';

/** OTHER */
export const API_DATE_FORMAT = 'yyyy-MM-dd\'T\'HH:mm:ss.SSSZ';
export const TRANSLATIONS_PARAM = 'translations';
export const PARAM_AMPOFFLINE_AGENT = 'AMPOffline';
export const POSSIBLE_VALUES_V2_MEDIA_TYPE = 'application/vnd.possible-values-v2+json';

export const AMP_COUNTRY_FLAG = '/aim/default/displayFlag.do';

export const DOWNLOAD_UPGRADE_URL = '/amp/download-upgrade'; // TODO: this url will change for sure.
export const PLATFORM_WINDOWS = 'windows';
export const PLATFORM_MAC_OS = 'osx';
export const PLATFORM_REDHAT = 'redhat';
export const PLATFORM_DEBIAN = 'debian';

export const ARCH64 = '64';
export const ARCH32 = '32';
export const ARCH64_NODE_OS_OPTIONS = new Set(['arm64', 'ppc64', 'x64']);
export const ARCH64_USER_AGENT_OPTIONS = ['x86_64', 'amd64'];
