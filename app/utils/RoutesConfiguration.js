import { GET_WORKSPACES_URL, LOGIN_URL, URL_CONNECTIVITY_CHECK_EP } from '../modules/connectivity/AmpApiConstants';

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
}];
module.exports = routesConfiguration;
