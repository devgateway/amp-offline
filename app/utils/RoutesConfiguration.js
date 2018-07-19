import {
  ACTIVITY_EXPORT_URL,
  ACTIVITY_IMPORT_URL,
  ACTIVITY_POSSIBLE_VALUES_PER_FIELD_PATHS,
  ACTIVITY_SINGLE_FIELDS_TREE_URL,
  AMP_COUNTRY_FLAG,
  AMP_REGISTRY_PRODUCTION_SETTINGS_URL,
  AMP_REGISTRY_STAGING_SETTINGS_URL,
  AVAILABLE_LANGUAGES_URL,
  CHANGE_PASSWORD_URL,
  CONTACT_POSSIBLE_VALUES_PER_FIELD_PATHS,
  CONTACT_PULL_URL,
  CONTACT_PUSH_URL,
  CONTACT_SINGLE_FIELDS_TREE_URL,
  DOWNLOAD_UPDATE_BINARY_URL,
  DOWNLOAD_UPGRADE_URL,
  ELECTRON_UPDATER_CHECK_URL,
  FEATURE_MANAGER_URL,
  GET_FULL_EXCHANGE_RATES,
  GET_INCREMENTAL_EXCHANGE_RATES,
  GET_TRANSLATIONS_URL,
  GET_WORKSPACES_URL,
  GLOBAL_SETTINGS_URL,
  LOGIN_URL,
  POSSIBLE_VALUES_V2_MEDIA_TYPE,
  POST_TRANSLATIONS_URL,
  RESET_PASSWORD_URL,
  SYNC_URL,
  TEST_URL,
  URL_CONNECTIVITY_CHECK_EP,
  USER_PROFILE_URL,
  WORKSPACE_MEMBER_URL,
  WORKSPACE_SETTINGS_URL,
  MAP_TILES_URL
} from '../modules/connectivity/AmpApiConstants';

const routesConfiguration = [{
  url: AMP_REGISTRY_PRODUCTION_SETTINGS_URL,
  isFull: true,
  method: 'GET',
  requiresAuth: false
}, {
  url: AMP_REGISTRY_STAGING_SETTINGS_URL,
  isFull: true,
  method: 'GET',
  requiresAuth: false
}, {
  url: GET_WORKSPACES_URL,
  method: 'GET',
  requiresAuth: true
}, {
  url: URL_CONNECTIVITY_CHECK_EP,
  method: 'GET',
  requiresAuth: false
}, {
  url: LOGIN_URL,
  method: 'POST',
  requiresAuth: false
}, {
  url: GLOBAL_SETTINGS_URL,
  method: 'GET',
  requiresAuth: true
}, {
  url: USER_PROFILE_URL,
  method: 'GET',
  requiresAuth: true
}, {
  url: WORKSPACE_MEMBER_URL,
  method: 'GET',
  requiresAuth: true
}, {
  url: AVAILABLE_LANGUAGES_URL,
  method: 'GET',
  requiresAuth: true
}, {
  url: POST_TRANSLATIONS_URL,
  method: 'POST',
  requiresAuth: true
}, {
  url: GET_TRANSLATIONS_URL,
  method: 'GET',
  requiresAuth: true
}, {
  url: ACTIVITY_IMPORT_URL,
  method: 'POST',
  requiresAuth: true
}, {
  url: ACTIVITY_EXPORT_URL,
  method: 'GET',
  requiresAuth: true
}, {
  url: ACTIVITY_SINGLE_FIELDS_TREE_URL,
  method: 'GET',
  requiresAuth: true
}, {
  url: ACTIVITY_POSSIBLE_VALUES_PER_FIELD_PATHS,
  method: 'POST',
  requiresAuth: true,
  accept: POSSIBLE_VALUES_V2_MEDIA_TYPE
}, {
  url: TEST_URL,
  method: 'GET',
  requiresAuth: true
}, {
  url: SYNC_URL,
  method: 'POST',
  requiresAuth: true
}, {
  url: AMP_COUNTRY_FLAG,
  method: 'GET',
  requiresAuth: true,
  regularAmpUrl: true,
  isBinary: true
}, {
  url: WORKSPACE_SETTINGS_URL,
  method: 'GET',
  requiresAuth: true
}, {
  url: GET_FULL_EXCHANGE_RATES,
  method: 'GET',
  requiredAuth: true
}, {
  url: GET_INCREMENTAL_EXCHANGE_RATES,
  method: 'GET',
  requiredAuth: true
}, {
  url: FEATURE_MANAGER_URL,
  method: 'POST',
  requiredAuth: true
}, {
  url: DOWNLOAD_UPGRADE_URL,
  method: 'GET',
  isBinary: true
}, {
  url: DOWNLOAD_UPDATE_BINARY_URL,
  method: 'GET',
  isBinary: true
}, {
  url: ELECTRON_UPDATER_CHECK_URL,
  method: 'GET',
  requiredAuth: false,
  translations: false,
}, {
  url: CONTACT_PULL_URL,
  method: 'GET',
  requiredAuth: true
}, {
  url: CONTACT_PUSH_URL,
  method: 'POST',
  requiredAuth: true
}, {
  url: CONTACT_PUSH_URL,
  method: 'PUT',
  requiredAuth: true
}, {
  url: CONTACT_SINGLE_FIELDS_TREE_URL,
  method: 'GET',
  requiredAuth: true
}, {
  url: CONTACT_POSSIBLE_VALUES_PER_FIELD_PATHS,
  method: 'POST',
  requiredAuth: true
}, {
  url: CHANGE_PASSWORD_URL,
  method: 'GET',
  requiredAuth: false,
  regularAmpUrl: true,
}, {
  url: RESET_PASSWORD_URL,
  method: 'GET',
  requiredAuth: false,
  regularAmpUrl: true,
}, {
  url: MAP_TILES_URL,
  method: 'GET',
  requiredAuth: true,
  regularAmpUrl: true,
}

];

module.exports = routesConfiguration;
