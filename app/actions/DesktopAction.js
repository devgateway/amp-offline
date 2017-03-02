// @flow
import UrlUtils from '../utils/URLUtils';
import DesktopManager from '../modules/projects/DesktopManager';

export const STATE_DESKTOP_LOADING = 'STATE_DESKTOP_LOADING';
export const STATE_DESKTOP_LOADED = 'STATE_DESKTOP_LOADED';
export const STATE_DESKTOP_ERROR = 'STATE_DESKTOP_ERROR';

export function loadDesktop(teamId) {
  console.log('loadDesktop');
  return (dispatch, ownProps) => {
    if (ownProps().desktop.isLoadingDesktop === false) {
      dispatch(sendingRequest());
      DesktopManager.generateDesktopData(teamId).then((data) => {
        dispatch(_loadDesktop({
          activeProjects: data.activeProjects,
          rejectedProjects: data.rejectedProjects,
          tabs: data.defaultTabs,
          paginationOptions: data.paginationOptions
        }));
        UrlUtils.forwardTo(`/desktop/${teamId}`);
      }).catch((error) => {
        dispatch(errorLoadDesktop(error));
      });
    }
  };
}

function _loadDesktop(actionData) {
  return {
    type: STATE_DESKTOP_LOADED,
    actionData: actionData,
  };
}

function errorLoadDesktop(error) {
  return { type: STATE_DESKTOP_ERROR, errorMessage: error };
}

function sendingRequest() {
  console.log('sendingRequestLoadingDesktop');
  return {
    type: STATE_DESKTOP_LOADING
  };
}