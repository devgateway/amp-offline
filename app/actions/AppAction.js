import * as URLUtils from '../utils/URLUtils';

export const STATE_GO_TO_PATH = 'STATE_GO_TO_PATH';
export const STATE_GO_TO_PATH_DONE = 'STATE_GO_TO_PATH_DONE';

export const triggerPathChange = (nextPath) => dispatch => dispatch({ type: STATE_GO_TO_PATH, actionData: nextPath });

export function goToPath(path) {
  return (dispatch) => {
    dispatch({ type: STATE_GO_TO_PATH_DONE });
    URLUtils.forwardTo(path);
  };
}
