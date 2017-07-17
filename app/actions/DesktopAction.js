/* eslint flowtype-errors/show-errors: 0 */
import UrlUtils from '../utils/URLUtils';
import DesktopManager from '../modules/desktop/DesktopManager';
import LoggerManager from '../modules/util/LoggerManager';
import { DESKTOP_URL } from '../utils/Constants';

export const STATE_DESKTOP_LOADING = 'STATE_DESKTOP_LOADING';
export const STATE_DESKTOP_LOADED = 'STATE_DESKTOP_LOADED';
export const STATE_DESKTOP_ERROR = 'STATE_DESKTOP_ERROR';
export const STATE_DESKTOP_RESET = 'STATE_DESKTOP_RESET';

export function loadDesktop(workspace, teamMemberId) {
  LoggerManager.log('loadDesktop');
  return (dispatch, ownProps) => {
    if (ownProps().desktopReducer.isLoadingDesktop === false) {
      dispatch(sendingRequest());
      // we need to send the currency convertor and the workspace currency so it can convert
      // totals
      const currentWsSettings = ownProps().workspaceReducer.currentWorkspaceSettings;
      const ratesManager = ownProps().currencyRatesReducer.currencyRatesManager;
      DesktopManager.generateDesktopData(workspace, teamMemberId, currentWsSettings, ratesManager).then((data) => {
        dispatch(_loadDesktop({
          activeProjects: data.activeProjects,
          rejectedProjects: data.rejectedProjects,
          tabs: data.defaultTabs
        }));
        return UrlUtils.forwardTo(`${DESKTOP_URL}/${workspace.id}`);
      }).catch((error) => {
        dispatch(errorLoadDesktop(error));
      });
    }
  };
}

export function resetDesktop() {
  LoggerManager.log('resetDesktop');
  return (dispatch) => {
    dispatch({ type: STATE_DESKTOP_RESET });
  };
}

function _loadDesktop(actionData) {
  return {
    type: STATE_DESKTOP_LOADED,
    actionData,
  };
}

function errorLoadDesktop(error) {
  return { type: STATE_DESKTOP_ERROR, errorMessage: error };
}

function sendingRequest() {
  LoggerManager.log('sendingRequestLoadingDesktop');
  return {
    type: STATE_DESKTOP_LOADING
  };
}
