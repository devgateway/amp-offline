// @flow
import UrlUtils from '../utils/URLUtils'


//Types of redux actions
export const STATE_DESKTOP_LOADING = 'STATE_DESKTOP_LOADING';
export const STATE_DESKTOP_LOADED = 'STATE_DESKTOP_LOADING';

//this will change its just a mockup
export function loadDesktop(teamId) {
  console.log('loadDesktop');
  return (dispatch, ownProps) => {
    if (ownProps().syncUp.loadingSyncHistory === false) {
      console.log('loading desktop');
      //this is to simulate loading activities in desktop
      setTimeout(_loadDesktop(teamId), 5000);
      dispatch(_loadDesktop(teamId));
    }
    dispatch(sendingRequest());
  };
}
function _loadDesktop(teamId) {
  let desktopData = {teamId: teamId};
  return {
    type: STATE_DESKTOP_LOADED,
    actionData: desktopData,
  }
}
function sendingRequest() {
  console.log('sendingRequestLoadingDesktop');
  return {
    type: STATE_DESKTOP_LOADING
  }
}
