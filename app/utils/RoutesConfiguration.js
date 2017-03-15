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
  SYNC_URL
} from '../modules/connectivity/AmpApiConstants';

const routesConfiguration = [{
  url: GET_WORKSPACES_URL,
  method: 'GET',
  requiresToken: true
}, {
  url: URL_CONNECTIVITY_CHECK_EP,
  method: 'GET',
  requiresToken: false
}, {
  url: LOGIN_URL,
  method: 'POST',
  requiresToken: false
}, {
  url: GLOBAL_SETTINGS_URL,
  method: 'GET',
  requiresToken: true
}, {
  url: USER_PROFILE_URL,
  method: 'GET',
  requiresToken: true
}, {
  url: WORKSPACE_MEMBER_URL,
  method: 'GET',
  requiresToken: true
}, {
  url: AVAILABLE_LANGUAGES_URL,
  method: 'GET',
  requiresToken: true
}, {
  url: POST_TRANSLATIONS_URL,
  method: 'POST',
  requiresToken: true
}, {
  url: GET_TRANSLATIONS_URL,
  method: 'GET',
  requiresToken: true
}, {
  url: TEST_URL,
  method: 'GET',
  requiresToken: true
}, {
  url: SYNC_URL,
  method: 'GET',
  requiresToken: true
}];

module.exports = routesConfiguration;
