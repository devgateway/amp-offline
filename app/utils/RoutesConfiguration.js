import {
  GET_WORKSPACES_URL,
  LOGIN_URL,
  URL_CONNECTIVITY_CHECK_EP,
  GLOBAL_SETTINGS_URL,
  USER_PROFILE_URL,
  WORKSPACE_MEMBER_URL,
  AVAILABLE_LANGUAGES_URL,
  POST_TRANSLATIONS_URL,
  TEST_URL,
  GET_TRANSLATIONS_URL,
  ACTIVITY_IMPORT_URL,
  ACTIVITY_EXPORT_URL,
  ACTIVITY_SINGLE_FIELDS_TREE_URL,
  ACTIVITY_POSSIBLE_VALUES_PER_FIELD_PATHS,
  SYNC_URL,
  AMP_COUNTRY_FLAG,
  WORKSPACE_SETTINGS_URL,
  FEATURE_MANAGER_URL,
  GET_FULL_EXCHANGE_RATES,
  GET_INCREMENTAL_EXCHANGE_RATES,
  POSSIBLE_VALUES_V2_MEDIA_TYPE,
  CONTACT_PULL_URL,
  CONTACT_SINGLE_FIELDS_TREE_URL,
  CONTACT_POSSIBLE_VALUES_PER_FIELD_PATHS
} from '../modules/connectivity/AmpApiConstants';

const routesConfiguration = [{
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
  url: CONTACT_PULL_URL,
  method: 'GET',
  requiredAuth: true
}, {
  url: CONTACT_SINGLE_FIELDS_TREE_URL,
  method: 'GET',
  requiredAuth: true
}, {
  url: CONTACT_POSSIBLE_VALUES_PER_FIELD_PATHS,
  method: 'POST',
  requiredAuth: true
}
];

module.exports = routesConfiguration;
