import WorkspaceManager from '../modules/workspace/WorkspaceManager';
import { loadDesktop } from './DesktopAction';
import TeamMemberHelper from '../modules/helpers/TeamMemberHelper';
import WorkspaceHelper from '../modules/helpers/WorkspaceHelper';
import * as ErrorNotificationHelper from '../modules/helpers/ErrorNotificationHelper';
import store from '../index';
import Logger from '../modules/util/LoggerManager';
import WSSettingsHelper from '../modules/helpers/WSSettingsHelper';
import PossibleValuesHelper from '../modules/helpers/PossibleValuesHelper';
import * as AC from '../utils/constants/ActivityConstants';
import { isForceSyncUp } from './SyncUpAction';
import { SYNCUP_REDIRECT_URL } from '../utils/Constants';
import * as URLUtils from '../utils/URLUtils';
import { NOTIFICATION_ORIGIN_WORKSPACE } from '../utils/constants/ErrorConstants';
import { FIELD_OPTIONS } from '../utils/constants/FieldPathConstants';

export const STATE_SELECT_WORKSPACE = 'STATE_SELECT_WORKSPACE';
export const STATE_SELECT_WORKSPACE_ERROR = 'STATE_SELECT_WORKSPACE_ERROR';
export const STATE_CONFIGURING_WORKSPACE_FILTER = 'STATE_CONFIGURING_WORKSPACE_FILTER';
export const STATE_CONFIGURED_WORKSPACE_FILTER = 'STATE_CONFIGURED_WORKSPACE_FILTER';

export const STATE_WORKSPACES_LOADING = 'STATE_WORKSPACES_LOADING';
export const STATE_WORKSPACES_LOADED = 'STATE_WORKSPACES_LOADED';
export const STATE_WORKSPACES_ERROR = 'STATE_WORKSPACES_ERROR';
export const STATE_WORKSPACE_LOAD_DENIED = 'STATE_WORKSPACE_LOAD_DENIED';

const logger = new Logger('Workspace action');

// TODO: THIS must be properly integrated through AMPOFFLINE-147
export function selectWorkspace(wsId) {
  logger.log('selectWorkspace');
  // adding this check here to avoid doing significant changes in the ws selection workflow just before the release
  // TODO prepare ws load from the desktop component
  if (isForceSyncUp()) {
    URLUtils.forwardTo(SYNCUP_REDIRECT_URL);
    return dispatch => dispatch({ type: STATE_WORKSPACE_LOAD_DENIED });
  }
  return (dispatch) => loadWorkspaceData(wsId).then(({ workspace, teamMember }) =>
    dispatch(loadDesktop(workspace, teamMember.id)));
}

function loadWorkspaceData(wsId) {
  const userId = store.getState().userReducer.userData.id;
  return Promise.all([
    WorkspaceHelper.findById(wsId),
    TeamMemberHelper.findByUserAndWorkspaceId(userId, wsId, true),
    WSSettingsHelper.findByWorkspaceId(wsId),
    PossibleValuesHelper.findById(`${AC.PPC_AMOUNT}~${AC.CURRENCY_CODE}`)
  ])
    .then(([workspace, teamMember, workspaceSettings, possibleValue]) => {
      if (!teamMember) {
        throw ErrorNotificationHelper.createNotification({
          message: 'Access Denied',
          origin: NOTIFICATION_ORIGIN_WORKSPACE
        });
      }
      const currency = {};
      currency.code = workspaceSettings.currency;
      currency['translated-value'] =
        possibleValue[FIELD_OPTIONS][workspaceSettings.currency]['translated-value'];
      workspaceSettings.currency = currency;
      const actionData = { teamMember, workspace, workspaceSettings };
      store.dispatch({ type: STATE_SELECT_WORKSPACE, actionData });
      return actionData;
    })
    .catch(err => {
      logger.error(err);
      store.dispatch({ type: STATE_SELECT_WORKSPACE_ERROR, actionData: err.toString() });
    });
}

export function reloadSelectedWorkspace() {
  const currentWorkspace = store.getState().workspaceReducer.currentWorkspace;
  const wsId = currentWorkspace && currentWorkspace.id;
  if (wsId) {
    loadWorkspaceData(wsId);
  }
}

export function loadWorkspaces() {
  const userId = store.getState().userReducer.userData.id;
  logger.log('loadWorkspaces');
  return (dispatch) => {
    dispatch({ type: STATE_WORKSPACES_LOADING });
    return WorkspaceManager.findAllWorkspacesForUser(userId).then((workspaces) => {
      workspaces = workspaces ? workspaces.sort((a, b) => {
        if (a.name.toLowerCase() > b.name.toLowerCase()) {
          return 1;
        }
        if (a.name.toLowerCase() < b.name.toLowerCase()) {
          return -1;
        }
        return 0;
      }) : [];
      return dispatch({ type: STATE_WORKSPACES_LOADED, actionData: workspaces });
    }).catch((err) => {
      logger.error(err);
      return dispatch({ type: STATE_WORKSPACES_ERROR, actionData: err });
    });
  };
}
