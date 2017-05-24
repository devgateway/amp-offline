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
  SINGLE_FIELDS_TREE_URL,
  POSSIBLE_VALUES_PER_FIELD_PATHS,
  SYNC_URL,
  AMP_COUNTRY_FLAG,
  WORKSPACE_SETTINGS_URL
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
  url: SINGLE_FIELDS_TREE_URL,
  method: 'GET',
  requiresAuth: true
}, {
  url: POSSIBLE_VALUES_PER_FIELD_PATHS,
  method: 'POST',
  requiresAuth: true
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
}
];

module.exports = routesConfiguration;
