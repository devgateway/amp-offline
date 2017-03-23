// TODO: this action is not going to be called from a component, its an initialization action
import store from '../index';
import ConnectionInformation from '../modules/connectivity/ConnectionInformation';
// this is temporal will be stored in settings
import { SERVER_URL, BASE_REST_URL, PROTOCOL, BASE_PORT, CONNECTION_TIMEOUT } from '../utils/Constants';

export const STATE_PARAMETERS_LOADED = 'STATE_PARAMETERS_LOADED';
export const STATE_PARAMETERS_LOADING = 'STATE_PARAMETERS_LOADING';
export const STATE_PARAMETERS_FAILED = 'STATE_PARAMETERS_FAILED';

/**
 * Checks and updates the connectivity status
 * @returns ConnectivityStatus
 */
export function ampStartUp() {
  return new Promise((resolve) => {
    console.log('ampStartUp');
    store.dispatch(sendingRequest());
    // TODO: we will have a module that will return this from storage, hardcoded in this first commit
    const connectionInformation = new ConnectionInformation(SERVER_URL, BASE_REST_URL, PROTOCOL, BASE_PORT,
      CONNECTION_TIMEOUT);
    store.dispatch(startUpLoaded(connectionInformation));
    // We will call a helper in the module to load this information.
    resolve();
  });
}

function startUpLoaded(connectionInformation) {
  return {
    type: STATE_PARAMETERS_LOADED,
    actionData: { connectionInformation }
  };
}

// TODO: Use this function somewhere.
/* eslint no-unused-vars: 0 */
function startUpFailed(err) {
  console.log('startUpFailed');
  return {
    type: STATE_PARAMETERS_FAILED,
    actionData: { errorMessage: err }
  };
}

function sendingRequest() {
  console.log('sendingRequest');
  return {
    type: STATE_PARAMETERS_LOADING
  };
}
