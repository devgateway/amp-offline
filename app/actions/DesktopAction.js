/* eslint flowtype-errors/show-errors: 0 */
import UrlUtils from '../utils/URLUtils';
import DesktopManager from '../modules/projects/DesktopManager';
import LoggerManager from '../modules/util/LoggerManager';

export const STATE_DESKTOP_LOADING = 'STATE_DESKTOP_LOADING';
export const STATE_DESKTOP_LOADED = 'STATE_DESKTOP_LOADED';
export const STATE_DESKTOP_ERROR = 'STATE_DESKTOP_ERROR';

export function loadDesktop(teamId, teamMemberId) {
  LoggerManager.log('loadDesktop');
  return (dispatch, ownProps) => {
    if (ownProps().desktop.isLoadingDesktop === false) {
      dispatch(sendingRequest());
      DesktopManager.generateDesktopData(teamId, teamMemberId).then((data) => {
        dispatch(_loadDesktop({
          activeProjects: data.activeProjects,
          rejectedProjects: data.rejectedProjects,
          tabs: data.defaultTabs
        }));
        return UrlUtils.forwardTo(`/desktop/${teamId}`);
      }).catch((error) => {
        dispatch(errorLoadDesktop(error));
      });
    }
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
