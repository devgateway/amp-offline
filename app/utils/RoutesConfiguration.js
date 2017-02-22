import {
  GET_WORKSPACES_URL,
  LOGIN_URL,
  URL_CONNECTIVITY_CHECK_EP,
  GLOBAL_SETTINGS_URL,
  USER_PROFILE_URL,
  WORKSPACE_MEMBER_URL,
  TEST_URL
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
  url: TEST_URL,
  method: 'GET',
  requiresToken: true
}];

module.exports = routesConfiguration;
